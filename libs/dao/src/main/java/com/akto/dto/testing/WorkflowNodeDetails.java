package com.akto.dto.testing;

import com.akto.dto.type.URLMethods.Method;

public class WorkflowNodeDetails {
    int apiCollectionId;
    String endpoint;
    Method method;
    WorkflowUpdatedSampleData updatedSampleData;

    Type type = Type.API;
    boolean overrideRedirect;
    String testValidatorCode;

    int waitInSeconds;

    public enum Type {
        POLL, API
    }

    // call this function to see if data being passed is legit or not
    public String validate() {
        if (this.type == null ) return "Type can't be null";
        if (this.endpoint == null ) return "URL can't be null";
        if (this.method == null ) return "Method can't be null";
        int waitThreshold = 60;
        if (waitInSeconds > waitThreshold) return "Wait time should be <= " + waitThreshold;

        return null;
    }

    public WorkflowNodeDetails() {
    }

    public WorkflowNodeDetails(int apiCollectionId, String endpoint, Method method, String testValidatorCode,
                               WorkflowUpdatedSampleData updatedSampleData, Type type, boolean overrideRedirect, int waitInSeconds) {
        this.apiCollectionId = apiCollectionId;
        this.endpoint = endpoint;
        this.method = method;
        this.updatedSampleData = updatedSampleData;
        this.type = type;
        this.overrideRedirect = overrideRedirect;
        this.testValidatorCode = testValidatorCode;
        this.waitInSeconds = waitInSeconds;
    }

    public int getApiCollectionId() {
        return this.apiCollectionId;
    }

    public void setApiCollectionId(int apiCollectionId) {
        this.apiCollectionId = apiCollectionId;
    }

    public String getEndpoint() {
        return this.endpoint;
    }

    public void setEndpoint(String endpoint) {
        this.endpoint = endpoint;
    }

    public Method getMethod() {
        return this.method;
    }

    public void setMethod(Method method) {
        this.method = method;
    }

    public WorkflowUpdatedSampleData getUpdatedSampleData() {
        return this.updatedSampleData;
    }

    public void setUpdatedSampleData(WorkflowUpdatedSampleData updatedSampleData) {
        this.updatedSampleData = updatedSampleData;
    }

    public Type getType() {
        return type;
    }

    public void setType(Type type) {
        this.type = type;
    }


    public boolean getOverrideRedirect() {
        return overrideRedirect;
    }

    public void setOverrideRedirect(boolean overrideRedirect) {
        this.overrideRedirect = overrideRedirect;
    }

    public boolean isOverrideRedirect() {
        return overrideRedirect;
    }

    public String getTestValidatorCode() {
        return testValidatorCode;
    }

    public void setTestValidatorCode(String testValidatorCode) {
        this.testValidatorCode = testValidatorCode;
    }

    public int getWaitInSeconds() {
        return waitInSeconds;
    }

    public void setWaitInSeconds(int waitInSeconds) {
        this.waitInSeconds = waitInSeconds;
    }

    @Override
    public String toString() {
        return "{" +
            " apiCollectionId='" + getApiCollectionId() + "'" +
            ", endpoint='" + getEndpoint() + "'" +
            ", method='" + getMethod() + "'" +
            ", updatedSampleData='" + getUpdatedSampleData() + "'" +
            "}";
    }

}