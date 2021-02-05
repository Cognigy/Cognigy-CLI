import axios, { AxiosRequestConfig, AxiosResponse, Method} from 'axios';
import * as FormData from 'form-data';

import CONFIG from './config';

axios.defaults.headers.common = {
    "X-API-Key": CONFIG.apiKey
};

interface IMakeAxiosRequestOptions {
    method: Method;
    path: string;
    data?: any;
    form?: FormData;
    type?: string;
};

/**
 * Executes the API Request
 * @param options 
 */
export const makeAxiosRequest = async (options: IMakeAxiosRequestOptions): Promise<AxiosResponse> => {
    const { method, path, data, form, type } = options;
    
    const url = CONFIG.baseUrl + path;
    const axiosOptions: AxiosRequestConfig = {
        headers: {
            "Accept": type || "application/json",
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
        },
        method,
        url,
        data: form || data
    };

    if (form) {
        axiosOptions.headers = Object.assign({}, axiosOptions.headers,form.getHeaders());
    }

    return await axios(axiosOptions);
}