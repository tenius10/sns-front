import axios from 'axios';

// axios 인스턴스 생성
const api = axios.create({
    baseURL: 'http://localhost:8080',
    timeout: 1000,
    withCredentials: true, // 쿠키 전송 설정
});

// 응답 인터셉터 설정
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        // 액세스 토큰이 만료되었을 경우
        if (error.response.status === 401 && error.config && !error.config.__isRetryRequest) {
            // 리프레시 토큰을 사용하여 새로운 액세스 토큰 발급
            await api.post('/api/auth/refresh').then(()=>{
                // 이전 요청 재시도
                error.config.__isRetryRequest = true;
                return api(error.config);
            }).catch(()=>{
                // 리프레시 토큰이 만료되었을 경우 로그아웃 처리
                console.log('Refresh token expired');
                window.location.href = "http://localhost:3000/login";
            });
        }
        return Promise.reject(error);
    }
);

export default api;