import React, { useState, useEffect, createContext } from "react";
import axios from 'axios';
import _ from 'lodash';

export interface User {
    email: string;
    userId: number;
    username: string;
    verified: boolean;
}

export interface Auth {
    user: User;
    getUser: Function;
    login: Function;
    signup: Function;
    logout: Function;
    changeUsername: Function;
    resetPassword: Function;
    changePassword: Function;
    deleteAccount: Function;
}

export default function useProvideAuth(): Auth {
    const [user, setUser] = useState<User>(null);

    //the session object carries userId as a string: users.id is a bigint and pg hands
    //it back as "42". posts arrive already coerced (get_thread runs them through Number),
    //so normalize here at the boundary and let every consumer compare with ===.
    let normalizeUser = (data: any): User => data ? {...data, userId: Number(data.userId)} : data;

    let getUser = async (): Promise<User> => {
        if (user) {
            return user;
        } else {
            try {
                let userFetch = await axios.get('/api/user');
                let normalizedUser = normalizeUser(userFetch?.data);
                setUser(normalizedUser);
                return normalizedUser;
            } catch (err: any) {
                //being logged out is a 401 here, where rails answered 200 with an empty body.
                //that's the ordinary anonymous case rather than a failure, so report no user
                //instead of rejecting. anything else is a real error and still propagates.
                if (err.response?.status === 401) {
                    return null;
                }
                throw err;
            }
        }
    }
    
    const login = async (username: string, password: string): Promise<void> => {
        await axios.post('/api/login', {username: username, password: password});
        await getUser();
    };
  
    const signup = async (email: string, username: string, password: string): Promise<void> => {
        try {
            //signup returns an empty body and deliberately does not establish a session — it
            //sends a verification email instead. caching that empty object as the user would
            //make getUser's `if (user)` check short-circuit forever on a hollow record, so
            //leave the user unset and let the caller route to login.
            await axios.post('/api/signup', {email: email, username: username, password: password});
        } catch (err: any) {
            throw err.response.data || 'Error signing up.';
        }
    };
  
    const logout = async (): Promise<void> => {
        try {
            await axios.post('/api/user/logout');
        } catch(err) {
            console.error('failed to logout')
        } finally {
            window.location.reload();
        }
    };
  
    const resetPassword = async (email: string): Promise<void> => {
        try {
            await axios.post('/api/resetpassword', {email: email});
        } catch (err: any) {
            // eslint-disable-next-line no-throw-literal
            throw 'Error sending reset password email.';
        }
    };
  
    const changePassword = async (password: string, id: string) => {
        try {
            await axios.post('/api/changepassword', {password: password, id: id});
        } catch (err: any) {
            throw err.response.data || 'Error changing password';
        }
    }

    const changeUsername = async (username: string): Promise<void> => {
        try {
            await axios.post('/api/changeusername', {username: username});
            let newUser: User = _.cloneDeep(user);
            newUser.username = username;
            setUser(newUser)
        } catch (err: any) {
            throw err.response.data || 'Error changing username';
        }
    }

	let deleteAccount = async () => {
        await axios.delete(`/api/user`);
        setUser(null);
    }

    useEffect(() => {
        //getUser resolves null when logged out, so this only rejects on a real network or
        //server error. catch it so a failed session probe can't surface as an unhandled
        //rejection on every page load.
        getUser().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    // Return the user object and auth methods
    return {
      user,
      getUser,
      login,
      signup,
      logout,
      changeUsername,
      resetPassword,
      changePassword,
      deleteAccount
    };
  }

export const authContext = createContext<Auth>(null);

// Provider component that wraps your app and makes auth object ...
// ... available to any child component that calls useAuth().
export function ProvideAuth({ children }) {
  const auth = useProvideAuth();
  return <authContext.Provider value={auth}>{children}</authContext.Provider>;
}