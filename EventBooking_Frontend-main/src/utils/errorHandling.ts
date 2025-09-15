

export enum errorType {
    NETWORK_ERROR = 'network_error',
    VALIDATION_ERROR = 'validation_error',
    AUTHENTICATION_ERROR = 'authentication_error',
    AUTHORIZATION_ERROR = 'authorization_error',
    RATE_LIMIT_ERROR = 'rate_limit_error',
    SERVER_ERROR = 'server_error',
    UNKNOWN_ERROR = 'unknown_error',
    NOT_FOUND_ERROR = 'Not_FoundoError',
    DUPLICATION_ERROR = 'duplicate_request'
}



export interface ClassifiedError {
    type: errorType;
    message: string;
    technicalMessage: string;
    statusCode?: number;
    fielderrors?: Array<{
        field: string;
        message: string;
    }>;
    retryable: boolean;
    severity: 'low' | 'medium' | 'high' | 'critical'
}

export const classifyError = (error: any): ClassifiedError => {
   
    if (error.request && !error.response) {
        return {
            type: errorType.NETWORK_ERROR,
            message: "Unable to connect to server. Please check your internet connection.",
            technicalMessage: 'Network error :' + error.message,
            retryable: true,
            severity: 'medium'

        }
    }
    if (error.response) {
        const
            { status, data } = error.response;
        console.log(" status data", status)
        switch (status) {
            case 400: return {
                type: errorType.VALIDATION_ERROR,
                message: data.message || 'Please check your input and try again',
                technicalMessage: `Validation errors : ${JSON.stringify(data.errors)}`,
                retryable: true,
                severity: 'low',
                fielderrors: data.errors,
                statusCode: 400
            };
            case 401: return {
                type: errorType.AUTHENTICATION_ERROR,
                message: 'Invalid  password. Please try again.',
                technicalMessage: `Authentication errors : ${JSON.stringify(data.message)}`,
                retryable: true,
                severity: 'low',
                statusCode: 401
            }
            case 403: return {
                type: errorType.AUTHORIZATION_ERROR,
                message: 'You dont have permission to perform this action',
                technicalMessage: `Authorizationn errors : ${JSON.stringify(data.message)}`,
                retryable: false,
                severity: 'low',
                statusCode: 401
            }
            case 429:
                const retryMatch = data.message.match(/(\d+)\s+minutes?/);
                const retryMinutes = retryMatch ? retryMatch[1] : '15';
                return {
                    type: errorType.RATE_LIMIT_ERROR,
                    message: `Too many attempts . Try again after ${retryMinutes} minutes`,
                    technicalMessage: ` Rate limit errors : ${JSON.stringify(data.message)}`,
                    retryable: true,
                    severity: 'medium',
                    statusCode: 429
                }
            case 404:
                return {
                    type: errorType.NOT_FOUND_ERROR, 
                    message: data.message.split(':')?.[1] || 'The requested resource was not found.',
                    technicalMessage: `Resource not found: ${JSON.stringify(data.message)}`,
                    retryable: false,
                    severity: 'low',
                    statusCode: 404
                };
                case 409: return {
                    type: errorType.DUPLICATION_ERROR, 
                    message: data.message.split(':')[1] || 'User has already created a request.',
                    technicalMessage: `Duplicate request: ${JSON.stringify(data.message)}`,
                    retryable: false,
                    severity: 'low',
                    statusCode: 409
                }
            case 500:
            case 502:
            case 503:
            case 504:
                return {
                    type: errorType.SERVER_ERROR,
                    message: "Something went wrong on our end. Please try again in a few minutes.",
                    technicalMessage: `Server error ${status}: ${data.message}`,
                    statusCode: status,
                    retryable: true,
                    severity: 'high'
                };
            default: return {
                type: errorType.UNKNOWN_ERROR,
                message: "An unexpected error occurred. Please try again.",
                technicalMessage: `Unknown HTTP error ${status}: ${data.message}`,
                statusCode: status,
                retryable: true,
                severity: 'medium'
            }
        }
    }
    return {
        type: errorType.UNKNOWN_ERROR,
        message: "An unexpected error occurred. Please try again.",
        technicalMessage: `request setup error : ${error.message}`,
        retryable: true,
        severity: 'low'
    }
}

export const getErrorMessage = (error: errorType, customMessage?: string): string => {
    if (customMessage) return customMessage;
    const defaultMessages = {
        [errorType.VALIDATION_ERROR]: "Please check your input and try again.",
        [errorType.AUTHENTICATION_ERROR]: "Invalid email or password. Please try again.",
        [errorType.AUTHORIZATION_ERROR]: "You don't have permission to perform this action.",
        [errorType.RATE_LIMIT_ERROR]: "Too many attempts. Please wait before trying again.",
        [errorType.SERVER_ERROR]: "Something went wrong on our end. Please try again in a few minutes.",
        [errorType.NETWORK_ERROR]: "Unable to connect to server. Please check your internet connection.",
        [errorType.UNKNOWN_ERROR]: "An unexpected error occurred. Please try again.",
        [errorType.NOT_FOUND_ERROR] : "The requested resource was not found.",
        [errorType.DUPLICATION_ERROR] : "User has already created a request."
    };
    return (defaultMessages[error])
}