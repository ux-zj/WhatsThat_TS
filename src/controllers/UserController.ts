import { AxiosInstance } from 'axios';
import { TUser } from '../types/TSchema';
import { TLoginResponse, TSignUpResponse } from '../types/TSchema';
import { AuthHeader } from '../util/helpers/api.helper';
import { RegularHeader } from '../util/helpers/api.helper';
import UrlBuilder from '../util/URLBuilder';
import { useApiContext } from '../context/ApiContext';

// https://github.com/ZJav1310/WhatsThat_TS/issues/1
class UserController {
  // FIXME: Some of the JSON things dont work and need ot be removed
  public static async login(email: string, password: string): Promise<TLoginResponse> {
    const myHeaders = RegularHeader();

    const requestOptions: RequestInit = {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify({ email, password }),
      redirect: 'follow',
    };

    return fetch(UrlBuilder.login(), requestOptions)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error, status = ${response.status}`);
        }
        return response.json();
      })
      .then((response) => response as TLoginResponse);
    // .catch((error) => console.log('Error caught while logging in user: ', error));
  }
  public static async logout(): Promise<Response> {
    const myHeaders = await AuthHeader();

    const requestOptions: RequestInit = {
      method: 'POST',
      headers: myHeaders,
      redirect: 'follow',
    };

    return fetch(UrlBuilder.logout(), requestOptions)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error, status = ${response.status}`);
        }
        return response.json();
      })
      .then((response) => response);
    // .catch((error) => console.log('Error caught while logging out user: ', error));
  }
  public static async register(
    first_name: string,
    last_name: string,
    email: string,
    password: string
  ): Promise<TSignUpResponse> {
    const myHeaders = RegularHeader();

    const requestOptions: RequestInit = {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify({
        first_name: first_name,
        llast_name: last_name,
        email: email,
        password: password,
      }),
      redirect: 'follow',
    };

    return fetch(UrlBuilder.createNewUser(), requestOptions)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error, status = ${response.status}`);
        }
        return response.json();
      })
      .then((response) => response);
    // .catch((error) => console.log('Error caught while registering user: ', error));
  }

  public static async getUserInfo(user_id: number, authApi: AxiosInstance): Promise<TUser> {
    const user = await authApi.get(`/user/${user_id}`);
    if (!user) {
      throw new Error(`Unable to find user`);
    }
    return user.data as TUser;
  }

  public static async updateUserInfo(user_id: number, payload: Partial<TUser>): Promise<Response> {
    const myHeaders = await AuthHeader();

    const requestOptions: RequestInit = {
      method: 'PATCH',
      headers: myHeaders,
      body: JSON.stringify(payload),
      redirect: 'follow',
    };

    return fetch(UrlBuilder.fetchUserInformation(user_id), requestOptions).then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error, status = ${response.status}`);
      }
      return response;
    });
    // .catch((error) => console.log('Error caught while updating user information: ', error));
  }
  // TODO: Below API things
  // public static async getUserPhoto() {}
  // public static async uploadUserPhoto() {}
  // public static async searchForUser() {}
}

export default UserController;
