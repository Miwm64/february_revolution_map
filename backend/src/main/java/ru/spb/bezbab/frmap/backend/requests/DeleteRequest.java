package ru.spb.bezbab.frmap.backend.requests;

public class DeleteRequest extends TokenRequest{
    private Integer id;
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }
}
