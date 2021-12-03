import { hrtime } from "process";

export const doLogging = (fn: (request: any) => Promise<any>) => {
    const log = (request: any, response: any, startTime: any) => {
        const endTime = hrtime(startTime);
        const duration = (endTime[0] + (endTime[1] / 1e9)).toFixed(3);
        console.log(`${request.method} ${request.uri} - ${response.statusCode} ${duration}`);
    }

    const wrapper = async (request: any) => {
        let response: any;

        const startTime = hrtime();

        try {
            response = await fn(request);
        } catch (error) {
            log(request, error, startTime);
            throw error;
        }

        log(request, response, startTime);

        return response;
    }

    return wrapper;
}