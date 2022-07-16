/* eslint-disable @typescript-eslint/naming-convention */

/**
 * @module kerberos
 */

import { generateUUID } from './uuid';
import fetch from 'node-fetch';
import convert from 'xml-js';
import { IOAuthInfoResponse } from 'src/interfaces/OAuthInfo';

export async function getAccessTokenWithKerberosTicket(
	kerberosTicket: string,
	domain: string,
	resource = 'https://graph.windows.net',
	clientId = '1b730954-1685-4b74-9bfd-dac224a7b894'
): Promise<IOAuthInfoResponse> {
	const requestId = generateUUID();
	const url = `https://autologon.microsoftazuread-sso.com/$domain/winauth/trust/2005/windowstransport?client-request-id=${requestId}`;
	const body = `
	<?xml version='1.0' encoding='UTF-8'?>
	<s:Envelope xmlns:s='http://www.w3.org/2003/05/soap-envelope' xmlns:wsse='http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd' xmlns:saml='urn:oasis:names:tc:SAML:1.0:assertion' xmlns:wsp='http://schemas.xmlsoap.org/ws/2004/09/policy' xmlns:wsu='http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd' xmlns:wsa='http://www.w3.org/2005/08/addressing' xmlns:wssc='http://schemas.xmlsoap.org/ws/2005/02/sc' xmlns:wst='http://schemas.xmlsoap.org/ws/2005/02/trust'>
		<s:Header>
			<wsa:Action s:mustUnderstand='1'>http://schemas.xmlsoap.org/ws/2005/02/trust/RST/Issue</wsa:Action>
			<wsa:To s:mustUnderstand='1'>https://autologon.microsoftazuread-sso.com/${domain}/winauth/trust/2005/windowstransport?client-request-id=${requestId}</wsa:To>
			<wsa:MessageID>urn:uuid:${generateUUID()}</wsa:MessageID>
		</s:Header>
		<s:Body>
			<wst:RequestSecurityToken Id='RST0'>
				<wst:RequestType>http://schemas.xmlsoap.org/ws/2005/02/trust/Issue</wst:RequestType>
				<wsp:AppliesTo>
					<wsa:EndpointReference>
						<wsa:Address>urn:federation:MicrosoftOnline</wsa:Address>
					</wsa:EndpointReference>
				</wsp:AppliesTo>
				<wst:KeyType>http://schemas.xmlsoap.org/ws/2005/05/identity/NoProofKey</wst:KeyType>
			</wst:RequestSecurityToken>
		</s:Body>
	</s:Envelope>
	`;
	const headers = {
		// eslint-disable-next-line @typescript-eslint/naming-convention
		'SOAPAction': 'http://schemas.xmlsoap.org/ws/2005/02/trust/RST/Issue',
		// eslint-disable-next-line @typescript-eslint/naming-convention
		'Authorization': `Negotiate ${kerberosTicket}`
	};

	const response = await fetch(
		url,
		{
			method: 'POST',
			body: body,
			headers: headers
		}
	);

	const responseData = convert.xml2js(await response.text());

	// ToDo: Implementation of the rest of https://github.com/Gerenios/AADInternals/blob/eade775c6cd4f8ed16bd77602e1ea12a02fe265e/Kerberos_utils.ps1

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
