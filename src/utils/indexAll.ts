import { AsyncReturnType } from 'type-fest';
import { IRestPagination, ICursorBasedPaginationReturnValue } from '@cognigy/rest-api-client/build/shared/mongoose/pagination';

const MAX_LIMIT = 100;
type TIndexFn<Query extends IRestPagination<Entity>, Entity> = (query: Query) => Promise<ICursorBasedPaginationReturnValue<Entity>>;

export const indexAll = <Query, Entity>(indexFn: TIndexFn<Query, Entity>) => {
	type TParams = Parameters<typeof indexFn>[0];
	type TResponse = AsyncReturnType<typeof indexFn>;
	type TResponseWithoutPagination = Pick<TResponse, 'items' | 'total'>;

	type TIndexAllFn = (query: TParams) => Promise<TResponseWithoutPagination>;

	const indexAllFn: TIndexAllFn = async query => {

		const firstResponse = await indexFn({
			...query,
			limit: MAX_LIMIT,
			skip: 0
		});

		const result: TResponseWithoutPagination = {
			items: [...firstResponse.items],
			total: firstResponse.total
		};

		const pages = Math.ceil(firstResponse.total / MAX_LIMIT);

		for (let page = 1; page <= pages; page++) {
			const newPage = await (indexFn({
				...query,
				limit: MAX_LIMIT,
				skip: MAX_LIMIT * page
			}));

			result.items = result.items.concat(newPage.items);
		}

		return result;
	}

	return indexAllFn;
};
