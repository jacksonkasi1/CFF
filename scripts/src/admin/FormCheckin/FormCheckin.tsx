import * as React from 'react';
import "./FormCheckin.scss";
import { IFormCheckinProps, IFormCheckinState } from './FormCheckin.d';
import { connect } from "react-redux";
import { fetchResponses, editResponse, editResponseBatch } from '../../store/responses/actions';
import ReactTable from "react-table";
import { get } from "lodash";
import { fetchRenderedForm } from '../../store/form/actions';
import Headers from '../util/Headers';
import { API } from "aws-amplify";
import InlineEdit from 'react-edit-inline';
import { hasPermission } from '../FormList/FormList';

const raceRowStyle = {
    "Half Marathon": { "backgroundColor": "rgb(255, 78, 80)" },
    "10K": { "backgroundColor": "rgb(252, 251, 227)" },
    "5K": { "backgroundColor": "rgb(0, 255, 0)" },
    "Mela": { "backgroundColor": "rgb(164, 194, 244)" }

}
class FormCheckin extends React.Component<IFormCheckinProps, IFormCheckinState> {
    constructor(props: any) {
        super(props);
        this.state = {
            searchText: "",
            searchFocus: false,
            autocompleteResults: [],
            isEditor: false
        };
    }

    async componentDidMount() {
        await this.props.fetchRenderedForm(this.props.match.params.formId);
        this.setState({
            isEditor: hasPermission(this.props.formState.renderedForm, "Forms_Edit", this.props.authState.userId)
        })
    }

    componentDidUpdate(prevProps: IFormCheckinProps) {
        if (prevProps.responsesState.responses !== this.props.responsesState.responses) {
            this.setState({searchFocus: false});
        }
    }

    search(search_by_id) {
        if (this.state.searchText) {
            this.props.fetchResponses(this.props.match.params.formId, this.state.searchText, search_by_id);
        }
    }

    async onSearchTextChange(value) {
        this.setState({ searchText: value });
        // if (value) {
        //     let queryStringParameters = { "query": value, "autocomplete": "1" };
        //     let results = await API.get("CFF", `forms/${this.props.match.params.formId}/responses`, { queryStringParameters });
        //     this.setState({ autocompleteResults: results.res || [] });
        // }
    }

    render() {
        const Card = ({ response }) => <div className="card" style={{ width: '100%' }}>
            <div className="card-body">
                <h5 className="card-title">{response.value.contact_name.first} {response.value.contact_name.last}</h5>
                <div className="card-text">
                    <div>{response._id.$oid.substring(0, 6)}</div>
                    <div>{response.value.email}</div>
                    <table className="table table-sm" style={{ wordBreak: "break-word" }}>
                        <tbody>
                            {response.value.participants.map((participant, i) => <tr style={raceRowStyle[participant.race]}>
                                <td>{participant.name.last}</td>
                                <td>{participant.name.first}</td>
                                <td>{participant.shirt_size}</td>
                                <td>{participant.race}</td>
                                <td>
                                    {this.state.isEditor ? <InlineEdit text={participant.bib_number || "None"} paramName={"data"}
                                        change={({data}) => this.props.editResponse(response._id.$oid, `participants.${i}.bib_number`, parseInt(data))} /> : 
                                    <div>{participant.bib_number}</div>}
                                </td>
                                <td>
                                    <input type="checkbox"
                                        checked={participant.checkin}
                                        onChange={e => this.props.editResponse(response._id.$oid, `participants.${i}.checkin`, e.target.checked)} />
                                </td>
                            </tr>)}
                        </tbody>
                    </table>
                </div>
                <button className="btn btn-sm btn-outline-primary" onClick={() => this.props.editResponseBatch(
                    response._id.$oid,
                    response.value.participants.map((p, i) => ({ "path": `participants.${i}.checkin`, "value": true }))
                )}>Check in all</button>
            </div>
        </div>;

        return (<div>
            <form onSubmit={e => { e.preventDefault(); this.search(false); return false; }}>
                <div className="dropdown show"  style={{ position: 'sticky', top: 0, zIndex: 99999 }}
                onFocus={e => this.setState({searchFocus: true})}
                >
                    <div className="input-group">
                        <input type="text" className="form-control cff-input-search" placeholder="Search..." autoComplete="off"
                            value={this.state.searchText} onChange={e => this.onSearchTextChange(e.target.value)}
                            />
                        <div className="input-group-append">
                            <button className="btn btn-primary" type="submit">
                                <i className="oi oi-magnifying-glass"></i>
                            </button>
                        </div>
                    </div>
                    <div className="dropdown-menu" style={{display: this.state.searchFocus ? "none": "none", width: "100%", zIndex: 0}}>
                        {this.state.autocompleteResults.map(result => 
                            result.value.participants.map((participant, i) =>
                                <a key={result._id.$oid + "_" + i} className="dropdown-item"
                                    onClick={e => this.setState({searchText: result._id.$oid, autocompleteResults: [], searchFocus: false}, () => this.search(true))}>
                                    {participant.name.first} {participant.name.last}
                                </a>
                            )
                        )}
                    </div>
                </div>
                
                {this.props.responsesState.responses && this.props.responsesState.responses.length > 0 && this.props.formState.renderedForm && this.props.responsesState.responses.map((response) =>
                    <Card response={response} key={response._id.$oid} />
                )}
            </form>
            {this.props.responsesState.responses && this.props.responsesState.responses.length === 0 &&
                <div className="mt-4">
                    No results found.
                </div>}
        </div>);
    }
}

const mapStateToProps = state => ({
    responsesState: state.responses,
    formState: state.form,
    authState: state.auth
});

const mapDispatchToProps = (dispatch, ownProps) => ({
    fetchResponses: (a, b, c) => dispatch(fetchResponses(a, b, c)),
    editResponse: (a, b, c) => dispatch(editResponse(a, b, c)),
    editResponseBatch: (a, b) => dispatch(editResponseBatch(a, b)),
    fetchRenderedForm: (a) => dispatch(fetchRenderedForm(a)),
});

export default connect(mapStateToProps, mapDispatchToProps)(FormCheckin);