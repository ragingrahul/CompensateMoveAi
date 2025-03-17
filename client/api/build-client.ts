import axios, { AxiosRequestHeaders } from "axios";
import { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";
export default (headers: ReadonlyHeaders) => {
    const headerObject = Object.fromEntries(headers.entries());

    return axios.create({
        baseURL: 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
        headers: headerObject
    })
}