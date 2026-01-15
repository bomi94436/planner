// 성공 응답 타입
interface SuccessResponse<T> {
  data: T
}

// 에러 응답 타입
interface ErrorResponse {
  error: string
}

export type Response<T> = SuccessResponse<T> | ErrorResponse
