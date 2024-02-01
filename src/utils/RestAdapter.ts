/* Node Modules */
import Axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import type {
    IHttpAdapter,
    IHttpRequest,
    IHttpResponse,
    IRestAPIClientConfig,
    TRestAPIClient
} from "@cognigy/rest-api-client";
import { BadRequestError } from "./BadRequestError";
import chalk from 'chalk';

/* Custom Modules */

interface IOptions {
    retries?: number;
}

export class RestAdapter implements IHttpAdapter {
    private config: IRestAPIClientConfig;
    private options: IOptions;

    constructor(config?: IRestAPIClientConfig, options?: IOptions) {
        this.config = config || {};
        this.options = options || {};
    }

    public setConfig(config: IRestAPIClientConfig): void {
        this.config = config || {};
    }

    public async request(httpRequest: IHttpRequest, client: TRestAPIClient, retries: number = 0): Promise<IHttpResponse> {

        let axiosResponse: AxiosResponse;

        try {
            if (httpRequest.withAuthentication) {
                const authenticationHeaders = await client.authenticationHandler?.getAuthenticationHeaders();
                httpRequest.headers = { ...httpRequest.headers, ...authenticationHeaders };
            }

            const axiosRequest = await this.convertRequest(httpRequest, client);

            axiosResponse = await Axios(axiosRequest) as AxiosResponse;
        } catch (err) {

            if (this.options.retries && retries < this.options.retries) {
                console.log(`\n${chalk.cyan("info:")} Retrying API request. Error was: ${err.message}\n, Request: ${JSON.stringify(httpRequest, null, 2)}`);

                return this.request(httpRequest, client, retries + 1);
            } else {
                throw err;
            }
        }

        if (axiosResponse.status >= 400) {
            if (this.options.retries && retries < this.options.retries && axiosResponse.status >= 500) {
                console.log(`\n${chalk.cyan("info:")} Retrying API request. Status code was: ${axiosResponse.status}`);
                return this.request(httpRequest, client, retries + 1);
            } else {
                this.handleError(axiosResponse);
            }
        }

        const response = await this.convertResponse(axiosResponse);
        return response;
    }

    public async get(request: IHttpRequest, client: TRestAPIClient): Promise<IHttpResponse> {
        return this.request({ ...request, method: "GET" }, client);
    }

    public async post(request: IHttpRequest, client: TRestAPIClient): Promise<IHttpResponse> {
        return this.request({ ...request, method: "POST" }, client);
    }

    public async patch(request: IHttpRequest, client: TRestAPIClient): Promise<IHttpResponse> {
        return this.request({ ...request, method: "PATCH" }, client);
    }

    public async put(request: IHttpRequest, client: TRestAPIClient): Promise<IHttpResponse> {
        return this.request({ ...request, method: "PUT" }, client);
    }

    public async head(request: IHttpRequest, client: TRestAPIClient): Promise<IHttpResponse> {
        return this.request({ ...request, method: "HEAD" }, client);
    }

    private async convertRequest(request: IHttpRequest, client: TRestAPIClient): Promise<AxiosRequestConfig> {

        const baseUrl = request.baseUrl || this.config.baseUrl;

        const axiosRequest: AxiosRequestConfig = {
            data: request.data,
            headers: request.headers,
            method: request.method || "GET",
            url: `${baseUrl}${request.url}`,
            // @ts-ignore
            validateStatus: null,
        };

        return axiosRequest;
    }

    private handleError(axiosResponse: AxiosResponse): void {
        const data = axiosResponse.data;

        throw new BadRequestError(data.title || data.error, data.detail || data.error_description, data.status, data.details);
    }

    private async convertResponse(axiosResponse: AxiosResponse): Promise<IHttpResponse> {

        const response: IHttpResponse = {
            data: axiosResponse.data,
            headers: axiosResponse.headers,
            status: axiosResponse.status,
            statusText: axiosResponse.statusText,
        };

        return response;
    }
}
