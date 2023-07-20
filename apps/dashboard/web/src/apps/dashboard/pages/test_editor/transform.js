import func from "@/util/func"
import {Tooltip, Box, Icon} from "@shopify/polaris"
import {FolderMajor} from "@shopify/polaris-icons"

const convertFunc = {
    mapCategoryToSubcategory: function (categoriesArr) {

        let aktoTests = {}
        let customTests = {}

        let totalCustomTests = 0
        let totalAktoTests = 0

        let mapTestToData = {}
        let mapIdtoTest = {}

        categoriesArr.forEach(test => {
            let obj = {
                label: test.testName,
                value: test.name,
                category: test.superCategory.displayName
            }
            if(test.templateSource._name === "CUSTOM"){
                if(!customTests[test.superCategory.name]){
                    customTests[test.superCategory.name] = []
                }
                customTests[test.superCategory.name].push(obj)
                totalCustomTests++
            }else{
                if(!aktoTests[test.superCategory.name]){
                    aktoTests[test.superCategory.name] = []
                }
                aktoTests[test.superCategory.name].push(obj)
                totalAktoTests++
            }

            let dataObj = {
                content: test.content,
                lastUpdated: func.prettifyEpoch(test.updatedTs),
                superCategory: test.superCategory.name,
                type: test.templateSource._name,
                category: test.superCategory.displayName
            }

            mapTestToData[test.testName] = dataObj
            mapIdtoTest[test.name] = test.testName
        });

        let resultObj = {
            aktoTests,customTests,totalAktoTests,totalCustomTests,mapTestToData,mapIdtoTest
        }

        return resultObj
    },

    getNavigationItems(testObj,param,selectedFunc){
        let arr = []
        if(param === 'CUSTOM'){
            for(const key in testObj?.customTests){
                if(testObj.customTests.hasOwnProperty(key)){
                    let item = {
                        label: (
                            <Tooltip content={testObj?.customTests[key][0]?.category} dismissOnMouseOut width="wide">
                                <span className="text-overflow" style={{'fontSize': '14px', 'gap': '6px'}}>
                                    <Box>
                                        <Icon source={FolderMajor} color="base"/>
                                    </Box>
                                    {testObj?.customTests[key][0]?.category}
                                </span>
                            </Tooltip>
                        ),
                        badge: testObj?.customTests[key]?.length.toString(),
                        url: '#',
                        onClick: (()=> selectedFunc(key+'_custom')),
                        subNavigationItems: testObj?.customTests[key],
                        key: key,
                        param: '_custom'
                    }
                    if(item.subNavigationItems.length > 0){
                        arr.push(item)
                    }
                }
            }
        }else{
            for(const key in testObj?.aktoTests){
                if(testObj.aktoTests.hasOwnProperty(key)){
                    let item = {
                        label: (
                            <Tooltip content={testObj?.aktoTests[key][0]?.category} dismissOnMouseOut width="wide">
                                <span className="text-overflow" style={{'fontSize': '14px', gap:'6px'}}>
                                    <Box>
                                        <Icon source={FolderMajor} color="base"/>
                                    </Box>
                                    {testObj?.aktoTests[key][0]?.category}
                                </span>
                            </Tooltip>
                        ),
                        badge: testObj.aktoTests[key]?.length.toString(),
                        url: '#',
                        onClick: (()=> selectedFunc(key+'_akto')),
                        subNavigationItems: testObj?.aktoTests[key],
                        key: key,
                        param: '_akto',
                    }
                    if(item.subNavigationItems.length > 0){
                        arr.push(item)
                    }
                }
            }
        }
        return arr
    },
    getTestInfo(testObj, testId) {
        const testInfo = {
            id: testId
        }

        const aktoTestsCheck = Object.values(testObj.aktoTests).flat().find(test => test.value === testId)
        const customTestsCheck = Object.values(testObj.customTests).flat().find(test => test.value === testId)

        if (aktoTestsCheck) {
            testInfo.label = aktoTestsCheck.label
            testInfo.category = aktoTestsCheck.category
            testInfo.source = "akto"
        } else if (customTestsCheck) {
            testInfo.label = customTestsCheck.label
            testInfo.category = customTestsCheck.category
            testInfo.source = "custom"
        } else {
            return null
        }

        return testInfo
    }
}

export default convertFunc