package ru.spb.bezbab.frmap.backend.controllers;

public abstract class Response<T> {
    private boolean isSuccess;
    private T data;

    public Response(boolean isSuccess, T data) {
        this.isSuccess = isSuccess;
        this.data = data;
    }

    public boolean isSuccess() {
        return isSuccess;
    }
    public T getData() {
        return data;
    }
}
