import { getAuthString } from '../auth';
import * as makeDebug from 'debug';
const debug = makeDebug('r6api:cmd:getPlaytime');
import fetcher from '../fetch';
import { URLS, Platform, UUID, isUuid } from '../constants';
import * as Errors from '../errors';

interface IPlaytime {
    'casualpvp_timeplayed:infinite': number;
    'rankedpvp_timeplayed:infinite': number;
}
interface INameApiResponse {
    results: {
        [id: string]: IPlaytime;
    };
}

export default async function getPlaytime(platform: Platform, ids: string | string[]) {
    const _ids = [].concat(ids);
    if (_ids.some(id => !isUuid(id))) {
        throw new Error('passed id is not a valid UUID');
    }
    debug('called with ids %o', _ids);
    if (_ids.length > 40) {
        throw new Errors.TooManyIdsError('too many ids passed (max. 40)');
    } else {
        const token = await getAuthString();
        const res = await fetcher<INameApiResponse>(
            `${URLS[platform].URL}${_ids.join(',')}`,
            {},
            token,
        );
        if (res instanceof Error) {
            throw res;
        }
        return [].concat(Object.keys(res.results)).map((key: UUID) => ({
            id: key,
            casual: res.results[key]['casualpvp_timeplayed:infinite'],
            ranked: res.results[key]['rankedpvp_timeplayed:infinite'],
        }));
    }
}
