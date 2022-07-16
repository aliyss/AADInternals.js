/* eslint-disable @typescript-eslint/naming-convention */
export interface IOAuthInfo {
	accessToken: string;
	refreshToken: string;
}

export interface IOAuthInfoResponse {
	'token_type': string,
	'scope': string,
	'expires_in': string,
	'ext_expires_in': string,
	'expires_on': string,
	'not_before': string,
	'resource': string,
	'access_token': string,
	'refresh_token': string,
	'id_token': string
}
