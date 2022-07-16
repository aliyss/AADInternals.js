import { getAccessTokenForAADGraph } from '../src';

(async () => {
	const accessCode = await getAccessTokenForAADGraph(
		{},
		true
	);
	console.log(accessCode);
})();

/*
 describe('deviceCode', function() {
 it('getCode', async function() {

 });
 });
 */
