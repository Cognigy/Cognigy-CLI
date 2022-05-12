/* Node Modules */
import * as requestPromise from "request-promise";
import { Response, UriOptions } from "request";

/* Custom Modules */
import {
	ErrorCode,
	ErrorCollection,
	IHttpAdapter,
	IHttpRequest,
	IHttpResponse,
	IRestAPIClientConfig,
} from "@cognigy/rest-api-client";

export class RequestPromiseAdapter implements IHttpAdapter {
	private config: IRestAPIClientConfig;

	constructor(config?: IRestAPIClientConfig) {
		this.config = config;
	}
	
	setConfig(config: IRestAPIClientConfig): void {
		throw new Error("Method not implemented.");
	}

	public async request(request: IHttpRequest, client: any): Promise<IHttpResponse> {
		const requestPromiseRequest = await this.convertRequest(request, client);
		const requestPromiseResponse = await requestPromise(requestPromiseRequest);

		const response = await this.convertResponse(requestPromiseResponse);
		return response;
	}

	public async get(request: IHttpRequest, client: any): Promise<IHttpResponse> {
		return this.request({ ...request, method: "GET" }, client);
	}

	public async post(request: IHttpRequest, client: any): Promise<IHttpResponse> {
		return this.request({ ...request, method: "POST" }, client);
	}

	public async patch(request: IHttpRequest, client: any): Promise<IHttpResponse> {
		return this.request({ ...request, method: "PATCH" }, client);
	}

	public async put(request: IHttpRequest, client: any): Promise<IHttpResponse> {
		return this.request({ ...request, method: "PUT" }, client);
	}

	public async head(request: IHttpRequest, client: any): Promise<IHttpResponse> {
		return this.request({ ...request, method: "HEAD" }, client);
	}

	private async convertRequest(request: IHttpRequest, client: any): Promise<requestPromise.RequestPromiseOptions & UriOptions> {
		const baseUrl = request.baseUrl || this.config.baseUrl;
		let additionalHeaders = await client.authenticationHandler?.getAuthenticationHeaders();

		const requestPromiseRequest: Partial<requestPromise.RequestPromiseOptions & UriOptions> = {
			uri: `${baseUrl}${request.url}`,
			body: request.data,
			headers: { ...request.headers, ...additionalHeaders },
			method: request.method || "GET",
			resolveWithFullResponse: true,
			json: request.headers['Content-Type']?.includes('application/json'),
		};

		return requestPromiseRequest as requestPromise.RequestPromiseOptions & UriOptions;
	}

	private async convertResponse(requestPromiseResponse: Response): Promise<IHttpResponse> {

		let body;
		if (requestPromiseResponse.headers['content-type']?.includes('application/json') && typeof requestPromiseResponse.body === "string") {
			body = JSON.parse(requestPromiseResponse.body);
		} else {
			body = requestPromiseResponse.body;
		}

		if (requestPromiseResponse.statusCode >= 400) {
			const errorClass =
				ErrorCollection[body.code as ErrorCode] ||
				ErrorCollection[requestPromiseResponse.statusCode as ErrorCode] ||
				ErrorCollection[ErrorCode.INTERNAL_SERVER_ERROR];

			if ((requestPromiseResponse.statusCode === 401 ||
				errorClass === ErrorCollection[ErrorCode.UNAUTHORIZED_ERROR]) &&
				typeof this.config.onUnauthorized === "function") {
				this.config.onUnauthorized();
			}

			throw new errorClass(
				body.detail,
				{ traceId: body.traceId },
				undefined,
				body.details
			);
		}

		const response: IHttpResponse = {
			data: body,
			headers: requestPromiseResponse.headers,
			status: requestPromiseResponse.statusCode,
			statusText: requestPromiseResponse.statusMessage,
		};

		return response;
	}
}
