/* eslint-disable camelcase */
/* eslint-disable react-hooks/rules-of-hooks */
import { TAddUser, TLoginResponse, TSignUpResponse, TUser } from '../types/TSchema';

interface IUserServices {
  login: (email: string, password: string) => Promise<TLoginResponse | undefined>;
  logout: () => Promise<Response | undefined>;
  register: (input: TAddUser) => Promise<TSignUpResponse | undefined>;
  getUserInfo: (user_id: number) => Promise<TUser | undefined>;
  updateUserInfo: (user_id: number, payload: any) => Promise<string | undefined>;
}
const UserServices = (apiCaller: any): IUserServices => {
  const login = async (email: string, password: string): Promise<TLoginResponse | undefined> => {
    const response = await apiCaller(
      { url: '/login', method: 'POST', data: { email, password } },
      false
    );
    return response.data as TLoginResponse;
  };

  const logout = async (): Promise<Response | undefined> => {
    const response = await apiCaller({ url: '/logout', method: 'POST' }, true);
    return response.data;
  };

  const register = async (input: TAddUser): Promise<TSignUpResponse | undefined> => {
    const response = await apiCaller({ url: '/user', method: 'POST', data: input }, false);
    return response.data as TSignUpResponse;
  };

  const getUserInfo = async (user_id: number): Promise<TUser | undefined> => {
    const response = await apiCaller({ url: `/user/${user_id}`, method: 'GET' }, true);
    return response.data as TUser;
  };

  const updateUserInfo = async (user_id: number, payload: any) => {
    const response = await apiCaller(
      { url: `/user/${user_id}`, method: 'PATCH', data: payload },
      true
    );
    return response.data;
  };

  return { login, logout, register, getUserInfo, updateUserInfo };
};

export default UserServices;
