package com.akto.action.testing;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import com.akto.action.UserAction;
import com.akto.dao.context.Context;
import com.akto.dao.testing.sources.TestSourceConfigsDao;
import com.akto.dto.testing.sources.TestSourceConfig;
import com.akto.util.enums.GlobalEnums;
import com.akto.util.enums.GlobalEnums.Severity;
import com.akto.util.enums.GlobalEnums.TestCategory;
import com.akto.util.enums.GlobalEnums.TestSubCategory;
import com.mongodb.BasicDBObject;
import com.mongodb.client.model.Filters;
import com.opensymphony.xwork2.Action;

import org.bson.conversions.Bson;

public class MarketplaceAction extends UserAction {
    
    List<TestSourceConfig> testSourceConfigs;
    List<TestSourceConfig> searchResults = new ArrayList<>();
    public String fetchAllMarketplaceSubcategories() {
        this.testSourceConfigs = TestSourceConfigsDao.instance.findAll(new BasicDBObject());
        return Action.SUCCESS.toUpperCase();
    }


    boolean defaultCreator;
    String subcategory;
    public String fetchTestingSources() {
        Bson creatorQ = Filters.ne(TestSourceConfig.CREATOR, "default");
        Bson subcategoryQ = Filters.eq(TestSourceConfig.SUBCATEGORY, subcategory);
        Bson filterQ = defaultCreator ? subcategoryQ : Filters.and(creatorQ, subcategoryQ);
        
        this.testSourceConfigs = TestSourceConfigsDao.instance.findAll(filterQ);
        return Action.SUCCESS.toUpperCase();
    }   

    String url;
    TestCategory category;
    Severity severity;
    String description;
    List<String> tags;
    String searchText;
    List<TestSubCategory> searchAktoTests;

    public String addCustomTest() {
        TestSourceConfig alreadyExists = TestSourceConfigsDao.instance.findOne("_id", url);
        if (alreadyExists != null) {
            addActionError("This test file has already been added");
            return ERROR.toUpperCase();            
        }

        TestSourceConfig elem = new TestSourceConfig(url, category, subcategory, severity, description, getSUser().getLogin(), Context.now(),tags);
        TestSourceConfigsDao.instance.insertOne(elem);
        return Action.SUCCESS.toUpperCase();
    }

    public String searchTestResults(){
        this.searchAktoTests = new ArrayList<>();
        //fill from Updated test-source-config collection in mongodb
        this.searchResults = TestSourceConfigsDao.instance.findAll(Filters.or(
            Filters.regex("severity", this.searchText, "i"),
            Filters.regex("category", this.searchText, "i"),
            Filters.regex("tags", this.searchText, "i"),
            Filters.regex("description", this.searchText, "i")
        ));

        this.searchText = this.searchText.toLowerCase();
        //fill from akto tests in global enums
        for(TestSubCategory tsc : GlobalEnums.TestSubCategory.getValuesArray()){
            String category = tsc.getSuperCategory().getName().toLowerCase();
            String severity = tsc.getSuperCategory().getSeverity().toString().toLowerCase();
            
            if(tsc.getIssueDescription().toLowerCase().matches("(.*)" + this.searchText + "(.*)")){
                this.searchAktoTests.add(tsc);
            }else if(tsc.getTestName().toLowerCase().matches("(.*)" + this.searchText + "(.*)")){
                this.searchAktoTests.add(tsc);
            }else if(category.matches("(.*)" + this.searchText + "(.*)")){
                this.searchAktoTests.add(tsc);
            }else if(severity.matches("(.*)" + this.searchText + "(.*)")){
                this.searchAktoTests.add(tsc);
            }

        }
        return Action.SUCCESS.toUpperCase();
    }

    public boolean isDefaultCreator() {
        return this.defaultCreator;
    }

    public boolean getDefaultCreator() {
        return this.defaultCreator;
    }

    public void setDefaultCreator(boolean defaultCreator) {
        this.defaultCreator = defaultCreator;
    }

    public String getSubcategory() {
        return this.subcategory;
    }

    public void setSubcategory(String subcategory) {
        this.subcategory = subcategory;
    }

    public List<TestSourceConfig> getTestSourceConfigs() {
        return this.testSourceConfigs;
    }

    public void setTestSourceConfigs(List<TestSourceConfig> testSourceConfigs) {
        this.testSourceConfigs = testSourceConfigs;
    }

    public String getUrl() {
        return this.url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public TestCategory getCategory() {
        return this.category;
    }

    public void setCategory(TestCategory category) {
        this.category = category;
    }

    public Severity getSeverity() {
        return this.severity;
    }

    public void setSeverity(Severity severity) {
        this.severity = severity;
    }

    public String getDescription() {
        return this.description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<String> getTags() {
        return this.tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    public List<TestSourceConfig> getSearchResults() {
        return this.searchResults;
    }

    public void setSearchResults(List<TestSourceConfig> searchResults) {
        this.searchResults = searchResults;
    }

    public String getSearchText() {
        return this.searchText;
    }

    public void setSearchText(String searchText) {
        this.searchText = searchText;
    }

    public List<TestSubCategory> getSearchAktoTests() {
        return this.searchAktoTests;
    }
    
}
