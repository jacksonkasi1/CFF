"""
pipenv run python -m unittest tests.integration.test_formSubmit
"""
import unittest
from chalice.config import Config
from chalice.local import LocalGateway
import json
from .constants import ONE_SCHEMA, ONE_UISCHEMA, ONE_FORMOPTIONS, ONE_FORMDATA
from app import app
from pydash.objects import set_
from tests.integration.baseTestCase import BaseTestCase

class FormSubmit(BaseTestCase):
    maxDiff = None
    # def setUp(self):
    #     super(FormSubmit, self).setUp()

    def test_submit_form_one(self):
        """Submit form."""
        self.formId = self.create_form()
        self.edit_form(self.formId, {"schema": ONE_SCHEMA, "uiSchema": ONE_UISCHEMA, "formOptions": ONE_FORMOPTIONS})
        response = self.lg.handle_request(method='POST',
                                          path='/forms/{}'.format(self.formId),
                                          headers={"Content-Type": "application/json"},
                                          body=json.dumps({"data": ONE_FORMDATA}))
        self.assertEqual(response['statusCode'], 200, response)
        body = json.loads(response['body'])
        responseId = body['res'].pop("id")
        self.assertEqual(body['res'], {}, body)
        self.assertIn("paymentMethods", body['res'])
        """View response."""
        response = self.lg.handle_request(method='GET',
                                          path='/responses/{}'.format(responseId),
                                          headers={},
                                          body='')
        self.assertEqual(response['statusCode'], 200, response)
        body = json.loads(response['body'])
        self.assertEqual(body['res']['value'], ONE_FORMDATA)
        
        """Edit response."""
        body = {"path": "value.contact_name.last", "value": "NEW_LAST!"}
        response = self.lg.handle_request(method='POST',
                                          path='/responses/{}/edit'.format(formId, responseId),
                                            headers={"Content-Type": "application/json"},
                                          body=json.dumps(body))
        expected_data = dict(ONE_FORMDATA)
        set_(expected_data, "contact_name.last", "NEW_LAST!")
        self.assertEqual(response['statusCode'], 200, response)
        body = json.loads(response['body'])
        self.assertEqual(body['res']['value'], expected_data)
    # def test_submit_form_ccavenue(self):
    #     formId = "c06e7f16-fcfc-4cb5-9b81-722103834a81"
    #     formData = {"name": "test"}
    #     ccavenue_access_code = "AVOC74EK51CE27COEC"
    #     ccavenue_merchant_id = "155729"
    #     response = self.lg.handle_request(method='POST',
    #                                       path='/forms/{}/responses'.format(formId),
    #                                       headers={"Content-Type": "application/json"},
    #                                       body=json.dumps(FORM_DATA_ONE))
    #     self.assertEqual(response['statusCode'], 200, response)
    #     body = json.loads(response['body'])
    #     responseId = body['res'].pop("id")
    #     ccavenue = body['res']["paymentMethods"]["ccavenue"]
    #     self.assertEqual(ccavenue["access_code"], ccavenue_access_code)
    #     self.assertEqual(ccavenue["merchant_id"], ccavenue_merchant_id)
    #     self.assertIn("encRequest", ccavenue)
    #     pass
    # def test_submit_form_manual_approval(self):
    #     # todo.
    #     pass
    # def test_submit_form_v2_manual(self):
    #     """Load form lists."""
    #     form_data = dict(FORM_DATA_ONE, email="success@simulator.amazonses.com")
    #     response = self.lg.handle_request(method='POST',
    #                                       path='/forms/{}/responses'.format(FORM_V2_ID),
    #                                       headers={"Content-Type": "application/json"},
    #                                       body=json.dumps(form_data))
    #     self.assertEqual(response['statusCode'], 200, response)
    #     body = json.loads(response['body'])
    #     responseId = body['res'].pop("id")
    #     self.assertEqual(body['res'], FORM_V2_SUBMIT_RESP)
    #     """View response."""
    #     response = self.lg.handle_request(method='GET',
    #                                       path='/forms/{}/responses/{}/view'.format(FORM_V2_ID, responseId),
    #                                       headers={},
    #                                       body='')
    #     self.assertEqual(response['statusCode'], 200, response)
    #     body = json.loads(response['body'])
    #     self.assertEqual(body['res']['value'], form_data['data'])