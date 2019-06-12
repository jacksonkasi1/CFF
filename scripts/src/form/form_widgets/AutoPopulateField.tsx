import * as React from "react";
import { get, cloneDeep } from "lodash";
import Loading from "../../common/Loading/Loading";
import Form from "react-jsonschema-form";
import CustomForm from "../CustomForm";

const cache = {};
class AutoPopulateField extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {
            loading: true,
            error: ""
        }
    }
    async componentDidMount() {
        try {
            let titleAccessor = this.props.uiSchema["ui:options"]["cff:autoPopulateTitleAccessor"];
            let endpoint = this.props.uiSchema["ui:options"]["cff:autoPopulateEndpoint"];
            let results = cache[endpoint] || await fetch(endpoint).then(e => e.json());
            cache[endpoint] = results;
            let options:any = [{"title": this.props.uiSchema["ui:placeholder"] || `Select ${this.props.name}` }];
            for (let result of results) {
                let option = {"type": typeof result, "properties": {} };
                if (titleAccessor) {
                    option["title"] = get(result, titleAccessor);
                }
                if (this.props.schema.type === "object") {
                    for (let key in this.props.schema.properties) {
                        option["properties"][key] = {"type": typeof result[key], "default": result[key], "readOnly": true, "const": result[key]};
                    }
                }
                // TODO: work with arrays.
                else {
                    option = result;
                }
                options.push(option);
            }
            let newSchema = {
                "type": "object",
                "oneOf": options,
                "default": options[0]
            };
            // this.props.formContext.setSchema(newSchema);
            this.setState({
                loading: false,
                newSchema
            })
        }
        catch (e) {
            console.error(e);
            this.setState({
                loading: false,
                error: "An error occurred. Please try again later."
            });
        }
    }
    render() {
        if (this.state.loading) {
            return <Loading />;
        }
        if (this.state.error) {
            return <div style={{ "color": "red" }}>{this.state.error}</div>
        }
        let {"ui:field": field, ...uiSchema} = this.props.uiSchema;
        return (<div>
            <CustomForm
                schema={this.state.newSchema}
                uiSchema={uiSchema}
                formData={this.props.formData}
                onChange={e => this.props.onChange(e.formData)}>&nbsp;</CustomForm>
        </div>);
    }
};
export default AutoPopulateField;
