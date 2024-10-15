import { Request, Response } from "express"
import { ApiResponse } from "../utils/apiResponse"

export class StatusController {
	static async getStatus(_req: Request, res: Response) {
		res.status(200).json(ApiResponse.success("Auth Service is up and running"))
	}
}
