/* eslint-disable @typescript-eslint/naming-convention */
import { IOAuthInfoResponse } from 'src/interfaces/OAuthInfo';
import { getAccessTokenWithKerberosTicket } from './utils/kerberos';
import { getAccessTokenUsingDeviceCode } from './utils/deviceCode';

function getAccessTokenWithPRT(
	cookie: string,
	resource: string,
	clientId: string
): IOAuthInfoResponse {
	return {
		'token_type': 'Bearer',
		'scope': 'user_impersonation',
		'expires_in': '',
		'ext_expires_in': '',
		'expires_on': '',
		'not_before': '',
		'resource': 'https://graph.windows.net',
		'access_token': '',
		'refresh_token': '',
		'id_token': ''
	};
}

function getAccessTokenWithRefreshToken(
	resource: string,
	clientId: string,
	tenantId: string,
	refreshToken: string
): string {
	return '';
}

export async function getAccessTokenForAADGraph(
	model: {
		kerberosTicket?: string,
		tokenPRT?: string,
		tenant?: string,
		domain?: string,
		resource?: string,
	},
	useDeviceCode = false
): Promise<IOAuthInfoResponse> {

	if (!model.resource) {
		model.resource = 'https://graph.windows.net';
	}

	return getAccessToken(
		{
			resource: model.resource,
			clientId: '1b730954-1685-4b74-9bfd-dac224a7b894',
			kerberosTicket: model.kerberosTicket,
			tokenPRT: model.tokenPRT,
			tenant: model.tenant,
			domain: model.domain
		},
		useDeviceCode
	);
}

export async function getAccessTokenForMSGraph(
	model: {
		kerberosTicket?: string,
		tokenPRT?: string,
		tenant?: string,
		domain?: string,
		resource?: string,
	},
	useDeviceCode = false
): Promise<IOAuthInfoResponse> {

	if (!model.resource) {
		model.resource = 'https://graph.microsoft.com';
	}

	return getAccessToken(
		{
			resource: model.resource,
			clientId: '1b730954-1685-4b74-9bfd-dac224a7b894',
			kerberosTicket: model.kerberosTicket,
			tokenPRT: model.tokenPRT,
			tenant: model.tenant,
			domain: model.domain
		},
		useDeviceCode
	);
}

/**
 * Gets the access token for provisioning API
 *
 * @param model
 * @param useDeviceCode
 */
export async function getAccessToken(
	model: {
		resource: string,
		clientId: string,
		kerberosTicket?: string,
		tokenPRT?: string,
		// eslint-disable-next-line @typescript-eslint/naming-convention
		BPRT?: string,
		tenant?: string,
		domain?: string
	},
	useDeviceCode = false
): Promise<IOAuthInfoResponse> {

	// eslint-disable-next-line @typescript-eslint/naming-convention
	let OAuthInfoResponse: IOAuthInfoResponse;

	if (model.kerberosTicket) {
		OAuthInfoResponse = await getAccessTokenWithKerberosTicket(
			model.kerberosTicket,
			model.resource,
			model.clientId,
			model.domain
		);
	} else if (model.tokenPRT) {
		OAuthInfoResponse = getAccessTokenWithPRT(
			model.tokenPRT,
			model.resource,
			model.clientId
		);
	} else if (useDeviceCode) {
		OAuthInfoResponse = <IOAuthInfoResponse>await getAccessTokenUsingDeviceCode(model);
	} else if (model.BPRT) {
		OAuthInfoResponse = {
			access_token: getAccessTokenWithRefreshToken(
				'urn:ms-drs:enterpriseregistration.windows.net',
				'b90d5b8f-5503-4153-b545-b31cecfaece2',
				'Common',
				model.BPRT
			),
			refresh_token: model.BPRT,
			'token_type': 'Bearer',
			'scope': 'user_impersonation',
			'expires_in': '',
			'ext_expires_in': '',
			'expires_on': '',
			'not_before': '',
			'resource': 'https://graph.windows.net',
			'id_token': ''
		};
	} else {
		throw 'Error with arguments!';
	}

	if (!OAuthInfoResponse) {
		throw 'Could not get OAuthInfo!';
	}

	const accessToken = OAuthInfoResponse.access_token;

	if (!accessToken) {
		throw 'Could not get Access Token!';
	}

	return OAuthInfoResponse;
}
