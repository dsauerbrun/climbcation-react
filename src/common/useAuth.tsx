import React, { useState, useEffect, createContext } from "react";
import axios from 'axios';
import _ from 'lodash';

export interface User {
    email: string;
    user_id: number;
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

    let getUser = async (): Promise<User> => {
        if (user) {
            return user;
        } else {
            let userFetch = await axios.get('/api/user');
            setUser(userFetch?.data);
            return userFetch?.data;
        }
    }
    
    const login = async (username: string, password: string): Promise<void> => {
        await axios.post('/api/login', {username: username, password: password});
        await getUser();
    };
  
    const signup = async (email: string, username: string, password: string): Promise<void> => {
        try {
            let userFetch = await axios.post('/api/signup', {email: email, username: username, password: password});
            setUser(userFetch?.data);
        } catch (err) {
            throw err.response.data || 'Error signing up.';
        }
    };
  
    const logout = () => {
    };
  
    const resetPassword = async (email: string): Promise<void> => {
        try {
            await axios.post('/api/resetpassword', {email: email});
        } catch (err) {
            // eslint-disable-next-line no-throw-literal
            throw 'Error sending reset password email.';
        }
    };
  
    const changePassword = async (password: string, id: string) => {
        try {
            await axios.post('/api/changepassword', {password: password, id: id});
        } catch (err) {
            throw err.response.data || 'Error changing password';
        }
    }

    const changeUsername = async (username: string): Promise<void> => {
        try {
            await axios.post('/api/changeusername', {username: username});
            let newUser: User = _.cloneDeep(user);
            newUser.username = username;
            setUser(newUser)
        } catch (err) {
            throw err.response.data || 'Error changing username';
        }
    }

	let deleteAccount = async () => {
        await axios.delete(`/api/user`);
        setUser(null);
    }

    useEffect(() => {
        getUser().then();
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