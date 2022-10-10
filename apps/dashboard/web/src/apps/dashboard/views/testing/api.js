import request from '@/util/request'

export default {
    fetchTestingDetails() {
        return request({
            url: '/api/retrieveAllCollectionTests',
            method: 'post',
            data: {}
        }).then((resp) => {
            return resp
        })
    },

    startTestForCustomEndpoints(apiInfoKeyList) {
        return request({
            url: '/api/startTest',
            method: 'post',
            data: {apiInfoKeyList, type: "CUSTOM"}
        }).then((resp) => {
            return resp
        })
    },

    startTestForCollection(apiCollectionId) {
        return request({
            url: '/api/startTest',
            method: 'post',
            data: {apiCollectionId, type: "COLLECTION_WISE"}
        }).then((resp) => {
            return resp
        })        
    },

    scheduleTestForCustomEndpoints(apiInfoKeyList, startTimestamp, recurringDaily) {
        return request({
            url: '/api/scheduleTest',
            method: 'post',
            data: {apiInfoKeyList, type: "CUSTOM", startTimestamp, recurringDaily}
        }).then((resp) => {
            return resp
        })        
    },

    scheduleTestForCollection(apiCollectionId, startTimestamp, recurringDaily) {
        return request({
            url: '/api/scheduleTest',
            method: 'post',
            data: {apiCollectionId, type: "COLLECTION_WISE", startTimestamp, recurringDaily}
        }).then((resp) => {
            return resp
        })        
    },

    addAuthMechanism(key, value, location) {
        return request({
            url: '/api/addAuthMechanism',
            method: 'post',
            data: {key, value, location}
        }).then((resp) => {
            return resp
        })        
    },

    fetchTestingRunResults() {
        return request({
            url: '/api/fetchTestingRunResults',
            method: 'post',
            data: {}
        }).then((resp) => {
            return resp
        })        
    },

    fetchRequestAndResponseForTest(x) {
        return request({
            url: '/api/fetchRequestAndResponseForTest',
            method: 'post',
            data: {testingRunResults:[x]}
        }).then((resp) => {
            return resp
        })        
    },

    stopAllTests() {
        return request({
            url: '/api/stopAllTests',
            method: 'post',
            data: {}
        }).then((resp) => {
            return resp
        })        
    }
}