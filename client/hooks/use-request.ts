import axios, { Method } from "axios";
import { useState } from "react";

import { UseRequestParams, UseRequestReturn } from "@/types/types";
import { request } from "http";

export default (requestParams: UseRequestParams): UseRequestReturn => {
    const [errors, setErrors] = useState<string | null>(null);
    const doRequest = async () => {
        try {
            const response = await axios[requestParams.method](requestParams.url, requestParams.body);
            if (requestParams.onSuccess) {
                requestParams.onSuccess(response.data);
            }
            return response.data;
        } catch (error) {

            if (error instanceof Error) {
                setErrors(error.message);
            } else {
                setErrors("An unknown error occurred");
            }
        }
    }

    return { doRequest, errors };
}