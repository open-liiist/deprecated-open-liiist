import { Application } from "express";
import { router } from "../../routes";
import { ApiResponse } from "../../utils/apiResponse";

export default (app: Application): void => {
	app.use(router);

	/** Error handling */
	app.use((_, res) => {
		res
			.status(404)
			.json(ApiResponse.error('Endpoint not found', 'NOT_FOUND'));
	});
}
