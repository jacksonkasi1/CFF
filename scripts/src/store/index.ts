import { combineReducers, Dispatch, Reducer } from 'redux';

import authReducer from './auth/reducer';
import formReducer from './form/reducer';

export const reducers: Reducer = combineReducers({
  auth: authReducer,
  form: formReducer
});
