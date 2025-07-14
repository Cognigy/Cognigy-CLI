/* Node Modules */
import Axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import type {
  IHttpAdapter,
  IHttpRequest,
  IHttpResponse,
  IRestAPIClientConfig,
  TRestAPIClient,
} from '@cognigy/rest-api-client';
import { BadRequestError } from './BadRequestError';

/* Custom Modules */

interface IOptions {
  retries?: number;
}

export class RestAdapter implements IHttpAdapter {
  private config: IRestAPIClientConfig;
  private options: IOptions;
  private cliVersion: string;
  private agentId: string;

  constructor(
    config: IRestAPIClientConfig = {},
    options: IOptions = {},
    cliVersion: string = 'unknown',
    agentId: string = 'unknown'
  ) {
    this.config = config;
    this.options = options;
    this.cliVersion = cliVersion;
    this.agentId = agentId;
  }

  public setConfig(config: IRestAPIClientConfig): void {
    this.config = config || {};
  }

  public async request(
    httpRequest: IHttpRequest,
    client: TRestAPIClient,
    retries: number = 0
  ): Promise<IHttpResponse> {
    let axiosResponse: AxiosResponse;

    try {
      // Construct the custom header
      const cliInfoHeader = `cognigy-cli/${this.cliVersion} project/${this.agentId}`;

      // Ensure headers object exists and add the custom header
      httpRequest.headers = {
        ...httpRequest.headers,
        'X-Cognigy-Client-Info': cliInfoHeader,
      };

      if (httpRequest.withAuthentication) {
        const authenticationHeaders =
          await client.authenticationHandler?.getAuthenticationHeaders();
        httpRequest.headers = {
          ...httpRequest.headers,
          ...authenticationHeaders,
        };
      }

      const axiosRequest = await this.convertRequest(httpRequest, client);

      axiosResponse = (await Axios(axiosRequest)) as AxiosResponse;
    } catch (err) {
      if (this.options.retries && retries < this.options.retries) {
        // console.log(`Retrying API request. Error was: ${err.message}\n, Request: ${JSON.stringify(httpRequest, null, 2)}`);

        return this.request(httpRequest, client, retries + 1);
      } else {
        throw err;
      }
    }

    if (axiosResponse.status >= 400) {
      if (
        this.options.retries &&
        retries < this.options.retries &&
        axiosResponse.status >= 500
      ) {
        // console.log(`Retrying API request. Status code was: ${axiosResponse.status}`);
        return this.request(httpRequest, client, retries + 1);
      } else {
        this.handleError(axiosResponse);
      }
    }

    const response = await this.convertResponse(axiosResponse);
    return response;
  }

  public async get(
    request: IHttpRequest,
    client: TRestAPIClient
  ): Promise<IHttpResponse> {
    return this.request({ ...request, method: 'GET' }, client);
  }

  public async post(
    request: IHttpRequest,
    client: TRestAPIClient
  ): Promise<IHttpResponse> {
    return this.request({ ...request, method: 'POST' }, client);
  }

  public async patch(
    request: IHttpRequest,
    client: TRestAPIClient
  ): Promise<IHttpResponse> {
    return this.request({ ...request, method: 'PATCH' }, client);
  }

  public async put(
    request: IHttpRequest,
    client: TRestAPIClient
  ): Promise<IHttpResponse> {
    return this.request({ ...request, method: 'PUT' }, client);
  }

  public async head(
    request: IHttpRequest,
    client: TRestAPIClient
  ): Promise<IHttpResponse> {
    return this.request({ ...request, method: 'HEAD' }, client);
  }

  private async convertRequest(
    request: IHttpRequest,
    client: TRestAPIClient
  ): Promise<AxiosRequestConfig> {
    const baseUrl = request.baseUrl || this.config.baseUrl;
    const method = request.method || 'GET';

    const axiosRequest: AxiosRequestConfig = {
      headers: request.headers,
      method,
      url: `${baseUrl}${request.url}`,
      // @ts-ignore
      validateStatus: null,
    };

    if (method !== 'GET' && method !== 'HEAD') {
      axiosRequest.data = request.data;
    } else if (request.data) {
      const stack = new Error().stack;
      console.warn(
        `Warning: RestAdapter: ${method} request to ${request.url} includes body data which will be ignored. ` +
          `This may indicate an issue with the API client implementation. ` +
          `Stack trace: ${stack}`
      );
    }

    return axiosRequest;
  }

  private handleError(axiosResponse: AxiosResponse): void {
    const data = axiosResponse.data;

    throw new BadRequestError(
      data.title || data.error,
      data.detail || data.error_description,
      data.status,
      data.details
    );
  }

  private async convertResponse(
    axiosResponse: AxiosResponse
  ): Promise<IHttpResponse> {
    const response: IHttpResponse = {
      data: axiosResponse.data,
      headers: axiosResponse.headers,
      status: axiosResponse.status,
      statusText: axiosResponse.statusText,
    };

    return response;
  }
}
