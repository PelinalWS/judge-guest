// UserContext: kullanıcı adı ve rolünün atanması
import React, { createContext, useContext, useEffect, useState } from 'react';

export const UserContext = createContext(null);
    
export const UserProvider = ({ children }) => {

    const [user, setLog] = useState({
        name: '',
        email: '',
        password: '',
    })

    return(
        <UserContext.Provider value={{ user, setLog }}>
            {children}
        </UserContext.Provider>
    );
};

const SignProvider = ({ children }) => {
    const [user, setSign] = useState({
        name: '',
        email: '',
        password: '',
        role: ''
    });
    return(
        <UserContext.Provider value={{user, setSign}}>
            {children}
        </UserContext.Provider>
    );
}