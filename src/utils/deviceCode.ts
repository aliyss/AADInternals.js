import { IOAuthInfoResponse } from 'src/interfaces/OAuthInfo';
import fetch from 'node-fetch';

const delay = (ms: number | undefined) => new Promise(resolve => setTimeout(
	resolve,
	ms
));

export async function getAccessTokenUsingDeviceCode(
	model: {
		clientId: string,
		tenant?: string
	},
	resource = 'https://graph.windows.net'
): Promise<IOAuthInfoResponse | void> {

	if (!model.tenant) {
		model.tenant = 'Common';
	}

	const body = {
		// eslint-disable-next-line @typescript-eslint/naming-convention
		'client_id': model.clientId,
		'resource': resource
	};

	const response = await fetch(
		`https://login.microsoftonline.com/${model.tenant}/oauth2/devicecode?api-version=1.0`,
		{
			method: 'post',
			body: new URLSearchParams(body),
			headers: {
				// eslint-disable-next-line @typescript-eslint/naming-convention
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		}
	);

	const responseData: any = await response.json();
	console.log(responseData.message);

	const interval = responseData.interval;
	const expires = responseData.expires_in;

	const body2 = {
		// eslint-disable-next-line @typescript-eslint/naming-convention
		'client_id': model.clientId,
		'resource': resource,
		// eslint-disable-next-line @typescript-eslint/naming-convention
		'grant_type': 'urn:ietf:params:oauth:grant-type:device_code',
		'code': responseData.device_code
	};

	let continueable = true;
	let total = 0;

	while (continueable) {
		await delay(interval * 1000);
		total += interval;

		if (total > expires) {
			throw 'Timeout occurred';
		}

		let response2;
		try {
			response2 = await fetch(
				`https://login.microsoftonline.com/${model.tenant}/oauth2/token?api-version=1.0`,
				{
					method: 'POST',
					body: new URLSearchParams(body2),
					headers: {
						// eslint-disable-next-line @typescript-eslint/naming-convention
						'Content-Type': 'application/x-www-form-urlencoded'
					}
				}
			);
			const responseData2: any = await response2.json();
			continueable = responseData2.error === 'authorization_pending';

			if (!continueable) {
				return responseData2;
			}
		} catch (e) {
			// No action on error
		}
	}
}
