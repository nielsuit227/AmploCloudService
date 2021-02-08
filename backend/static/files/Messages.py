import base64
import datetime
import json
import time
from google.api_core import retry
import jwt
import requests


def create_jwt(project_id, private_key_file, algorithm):
    token = {
            'iat': datetime.datetime.utcnow(),
            'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=60),
            'aud': project_id
    }
    with open(private_key_file, 'r') as f:
        private_key = f.read()
    return jwt.encode(token, private_key, algorithm=algorithm).decode('ascii')


@retry.Retry(predicate=retry.if_exception_type(AssertionError), deadline=60)
def publish_message(message, base_url, project_id, cloud_region, registry_id, device_id, jwt_token):
    headers = {
            'authorization': 'Bearer {}'.format(jwt_token),
            'content-type': 'application/json',
            'cache-control': 'no-cache'
    }
    print(headers)
    url_suffix = 'publishEvent'
    publish_url = (
        '{}/projects/{}/locations/{}/registries/{}/devices/{}:{}').format(
            base_url, project_id, cloud_region, registry_id, device_id,
            url_suffix)
    print(publish_url)
    msg_bytes = base64.urlsafe_b64encode(message.encode('utf-8'))
    body = {'binary_data': msg_bytes.decode('ascii')}
    resp = requests.post(publish_url, data=json.dumps(body), headers=headers)
    if resp.status_code != 200:
        print('Response came back {}, retrying'.format(resp.status_code))
    return resp


@retry.Retry(
    predicate=retry.if_exception_type(AssertionError),
    deadline=60)
def get_config(version, base_url, project_id, cloud_region, registry_id,
        device_id, jwt_token):
    headers = {
            'authorization': 'Bearer {}'.format(jwt_token),
            'content-type': 'application/json',
            'cache-control': 'no-cache'
    }
    basepath = '{}/projects/{}/locations/{}/registries/{}/devices/{}/'
    template = basepath + 'config?local_version={}'
    config_url = template.format(
        base_url, project_id, cloud_region, registry_id, device_id, version)
    resp = requests.get(config_url, headers=headers)
    if resp.status_code != 200:
        print('Error getting config: {}, retrying'.format(resp.status_code))
        raise AssertionError('Not OK response: {}'.format(resp.status_code))
    return resp


def main():
    device = 'prototype-0'
    project = 'ambibox'
    privateKeyFile = 'KeyPairs/'+device+'_private.pem'
    algorithm = 'RS256'
    message = 'Testing'
    baseUrl = 'https://cloudiotdevice.googleapis.com/v1'
    registry = 'prototypes'
    region = 'us-central1'

    jwtToken = create_jwt(project, privateKeyFile, algorithm)
    resp = publish_message(message, baseUrl, project, region, registry, device, jwtToken)
    print('HTTP response: ', resp)


if __name__ == '__main__':
    main()