package ru.spb.bezbab.frmap.backend.controllers;

public class ResponseFailure extends Response<String> {
    public ResponseFailure(String msg){
        super(false, msg);
    }
}
