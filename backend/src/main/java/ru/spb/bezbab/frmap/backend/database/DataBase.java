package ru.spb.bezbab.frmap.backend.database;

import java.sql.*;
import java.util.Properties;

public class DataBase {
    private Connection connection;
    private final String url;
    private final String user;
    private final String password;

    public DataBase(String url, String user, String password) {
        this.url = url;
        this.user = user;
        this.password = password;
    }


    public void connect() {
        final Properties props = new Properties();
        props.setProperty("user", user);
        props.setProperty("password", password);

        try {
            connection = DriverManager.getConnection(url, props);
            var st = connection.createStatement();
        } catch(SQLException e) {
            System.out.println(e.getMessage());
        }
    }

    public Statement getStatement(){
        Statement st;
        try {
            st = connection.createStatement();
        }
        catch (Exception e){
            throw new RuntimeException("Couldn't create statement");
        }
        return st;
    }
}