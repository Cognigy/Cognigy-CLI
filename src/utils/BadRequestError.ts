export class BadRequestError extends Error {

	public name: string;
	public msg: string;
	public httpStatusCode: number;
	public httpStatusText: string;
	public details: Record<string, unknown>

	constructor(name:string, message: string, statusCode: number, details: Record<string, unknown>) {
		super(message);

		this.name = name;
		this.msg = message;
		this.httpStatusCode = statusCode;
		this.httpStatusText = name;
		this.details = details
	}
}