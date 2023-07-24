import {
  CircleCancelMinor,
  CalendarMinor,
  ClockMinor
} from '@shopify/polaris-icons';
import { saveAs } from 'file-saver'
import inventoryApi from "../apps/dashboard/pages/observe/api"

const func = {
  toDateStr(date, needYear) {
    let strArray = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let d = date.getDate();
    let m = strArray[date.getMonth()];
    let y = date.getFullYear();
    return m + ' ' + d + (needYear ? ' ' + y : '');
  },
  prettifyEpoch(epoch) {
    let diffSeconds = (+Date.now()) / 1000 - epoch
    let sign = 1
    if (diffSeconds < 0) { sign = -1 }

    if (diffSeconds < 120) {
      return '1 minute ago'
    } else if (diffSeconds < 3600) {
      return Math.round(diffSeconds / 60) + ' minutes ago'
    } else if (diffSeconds < 7200) {
      return '1 hour ago'
    } else if (diffSeconds < 86400) {
      return Math.round(diffSeconds / 3600) + ' hours ago'
    }

    let diffDays = diffSeconds / 86400
    let diffWeeks = diffDays / 7
    let diffMonths = diffDays / 30
    let count = Math.round(diffDays)
    let unit = 'day'

    if (diffMonths > 2) {
      return this.toDateStr(new Date(epoch * 1000), true)
    } else if (diffWeeks > 4) {
      count = Math.round(diffMonths + 0.5)
      unit = 'month'
    } else if (diffDays > 11) {
      count = Math.round(diffWeeks + 0.5)
      unit = 'week'
    } else if (diffDays === 1) {
      return sign > 0 ? 'tomorrow' : 'yesterday'
    } else if (diffDays === 0) {
      return 'today'
    }

    let plural = count <= 1 ? '' : 's'

    return count + ' ' + unit + plural + ' ago'
  },

  toSentenceCase(str) {
    if (str == null) return ""
    return str[0].toUpperCase() + (str.length > 1 ? str.substring(1).toLowerCase() : "");
  },
  testingResultType() {
    return {
      BURP: "BURP",
      CICD: "CICD",
      EXTERNAL_API: "EXTERNAL_API"
    }
  },
  initials(str) {
    if (!str)
      return ''

    let ret = str.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()

    if (ret.length == 1) {
      return str.replaceAll(" ", "").slice(0, 2).toUpperCase()
    } else {
      return ret
    }
  },
  valToString(val) {
    if (val instanceof Set) {
      return [...val].join(" & ")
    } else {
      return val || "-"
    }
  },
  downloadAsCSV(data, selectedTestRun) {
    // use correct function, this does not expand objects.
    let headerTextToValueMap = Object.keys(data[0])

    let csv = headerTextToValueMap.join(",") + "\r\n"
    data.forEach(i => {
      csv += Object.values(headerTextToValueMap).map(h => this.valToString(i[h])).join(",") + "\r\n"
    })
    let blob = new Blob([csv], {
      type: "application/csvcharset=UTF-8"
    });
    saveAs(blob, (selectedTestRun.name || "file") + ".csv");
  },
  flattenObject(obj, prefix = '') {
    return Object.keys(obj).reduce((acc, k) => {
      const pre = prefix.length ? `${prefix}.` : '';
      if (
        typeof obj[k] === 'object' &&
        obj[k] !== null &&
        Object.keys(obj[k]).length > 0
      )
        Object.assign(acc, this.flattenObject(obj[k], pre + k));
      else acc[pre + k] = obj[k];
      return acc;
    }, {})
  },
  findInObjectValue(obj, query, keysToIgnore = []) {
    let flattenedObject = this.flattenObject(obj);
    let ret = false;
    Object.keys(flattenedObject).forEach((key) => {
      ret |= !keysToIgnore.some(ignore => key.toLowerCase().includes(ignore.toLowerCase())) &&
        flattenedObject[key].toString().toLowerCase().includes(query);
    })
    return ret;
  },
  getSeverityStatus(countIssues) {
    return Object.keys(countIssues).filter((key) => {
      return (countIssues[key] > 0)
    })
  },
  getTestingRunIcon(state) {
    switch (state) {
      case "RUNNING": return ClockMinor;
      case "SCHEDULED": return CalendarMinor;
      case "STOPPED": return CircleCancelMinor;
      default: return ClockMinor;
    }
  },
  getSeverity(countIssues) {
    if (countIssues == null) {
      return []
    }
    return Object.keys(countIssues).filter((key) => {
      return (countIssues[key] > 0)
    }).map((key) => {
      return countIssues[key] + " " + key
    })
  },
  getStatus(item) {
    let localItem = item.toUpperCase();
    if(localItem.includes("HIGH")) return 'critical';
    if(localItem.includes("MEDIUM")) return 'warning';
    if(localItem.includes("LOW")) return 'neutral';
    return "";
  },
  getRunResultSubCategory(runResult, subCategoryFromSourceConfigMap, subCategoryMap, fieldName) {
    if (subCategoryMap[runResult.testSubType] === undefined) {
      let a = subCategoryFromSourceConfigMap[runResult.testSubType]
      return a ? a.subcategory : null
    } else {
      return subCategoryMap[runResult.testSubType][fieldName]
    }
  },

  getRunResultCategory(runResult, subCategoryMap, subCategoryFromSourceConfigMap, fieldName) {
    if (subCategoryMap[runResult.testSubType] === undefined) {
      let a = subCategoryFromSourceConfigMap[runResult.testSubType]
      return a ? a.category.shortName : null
    } else {
      return subCategoryMap[runResult.testSubType].superCategory[fieldName]
    }
  },

  getRunResultSeverity(runResult, subCategoryMap) {
    let testSubType = subCategoryMap[runResult.testSubType]
    if (!testSubType) {
      return "HIGH"
    } else {
      let a = testSubType.superCategory["severity"]["_name"]
      return a
    }
  }
  ,
  copyToClipboard(text) {
    if (!navigator.clipboard) {
      // Fallback for older browsers (e.g., Internet Explorer)
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = 0;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return;
    }

    // Using the Clipboard API for modern browsers
    navigator.clipboard.writeText(text)
      .then(() => {
        // Add toast here
        console.log('Text copied to clipboard successfully!');
      })
      .catch((err) => {
        console.error('Failed to copy text to clipboard:', err);
      });
  },
  epochToDateTime(timestamp) {
    var date = new Date(timestamp * 1000);
    return date.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
  },

  getListOfHosts(apiCollections) {
    let result = []
    if (!apiCollections || apiCollections.length === 0) return []
    apiCollections.forEach((x) => {
      let hostName = x['hostName']
      if (!hostName) return
      result.push(
        {
          "label": hostName,
          "value": hostName
        }
      )
    })
    return result
  },
  convertTrafficMetricsToTrend(trafficMetricsMap) {
    let result = []
    for (const [key, countMap] of Object.entries(trafficMetricsMap)) {
      let trafficArr = []
      for (const [key, value] of Object.entries(countMap)) {
        const epochHours = parseInt(key);
        const epochMilliseconds = epochHours * 3600000;
        trafficArr.push([epochMilliseconds, value]);
      }

      result.push(
        { "data": trafficArr, "color": null, "name": key },
      )
    }
    return result
  },
  prepareFilters: (data, filters) => {
    let localFilters = filters;
    localFilters.forEach((filter, index) => {
      localFilters[index].availableChoices = new Set()
      localFilters[index].choices = []
    })
    data.forEach((obj) => {
      localFilters.forEach((filter, index) => {
        let key = filter["key"]
        obj[key].map((item) => filter.availableChoices.add(item));
        localFilters[index] = filter
      })
    })
    localFilters.forEach((filter, index) => {
      let choiceList = []
      filter.availableChoices.forEach((choice) => {
        choiceList.push({ label: choice, value: choice })
      })
      localFilters[index].choices = choiceList
    })
    return localFilters
  },
  timeNow: () => {
    return parseInt(new Date().getTime() / 1000)
  },
  requestJson: function (message, highlightPaths) {
    let result = {}
    let requestHeaders = {}

    let requestHeadersString = "{}"
    let requestPayloadString = "{}"
    let queryParamsString = ""
    if (message["request"]) {
      queryParamsString = message["request"]["queryParams"]
      requestHeadersString = message["request"]["headers"] || "{}"
      requestPayloadString = message["request"]["body"] || "{}"
    } else {
      let url = message["path"]
      let urlSplit = url.split("?")
      queryParamsString = urlSplit.length > 1 ? urlSplit[1] : ""

      requestHeadersString = message["requestHeaders"] || "{}"
      requestPayloadString = message["requestPayload"] || "{}"
    }

    const queryParams = {}
    if (queryParamsString) {
      let urlSearchParams = new URLSearchParams(queryParamsString)
      for (const [key, value] of urlSearchParams) {
        queryParams[key] = value;
      }
    }

    try {
      requestHeaders = JSON.parse(requestHeadersString)
    } catch (e) {
      // eat it
    }

    let requestPayload = {}
    try {
      requestPayload = JSON.parse(requestPayloadString)
    } catch (e) {
      requestPayload = requestPayloadString
    }

    result["json"] = { "queryParams": queryParams, "requestHeaders": requestHeaders, "requestPayload": requestPayload }
    result["highlightPaths"] = {}
    for (const x of highlightPaths) {
      if (x["responseCode"] === -1) {
        let keys = []
        if (x["header"]) {
          keys.push("root#" + "requestheaders#" + x["param"])
        } else {
          keys.push("root#" + "requestpayload#" + x["param"])
          keys.push("root#" + "queryParams#" + x["param"])
        }

        keys.forEach((key) => {
          key = key.toLowerCase()
          result["highlightPaths"][key] = x["highlightValue"]
        })
      }
    }
    return result
  },
  responseJson: function (message, highlightPaths) {
    let result = {}

    let responseHeadersString = "{}"
    let responsePayloadString = "{}"
    if (message["request"]) {
      responseHeadersString = message["response"]["headers"] || "{}"
      responsePayloadString = message["response"]["body"] || "{}"
    } else {
      responseHeadersString = message["responseHeaders"] || "{}"
      responsePayloadString = message["responsePayload"] || "{}"
    }

    let responseHeaders = {};
    try {
      responseHeaders = JSON.parse(responseHeadersString)
    } catch (e) {
      // eat it
    }
    let responsePayload = {}
    try {
      responsePayload = JSON.parse(responsePayloadString)
    } catch (e) {
      responsePayload = responsePayloadString
    }
    result["json"] = { "responseHeaders": responseHeaders, "responsePayload": responsePayload }
    result["highlightPaths"] = {}
    for (const x of highlightPaths) {
      if (x["responseCode"] !== -1) {
        let key = ""
        if (x["header"]) {
          key = "root#" + "responseheaders#" + x["param"]
        } else {
          key = "root#" + "responsepayload#" + x["param"];
        }
        key = key.toLowerCase();
        result["highlightPaths"][key] = x["highlightValue"]
      }
    }
    return result
  },

  mapCollectionIdToName(collections) {
    let collectionsObj = {}
    collections.forEach((collection)=>{
      if(!collectionsObj[collection.id]){
        collectionsObj[collection.id] = collection.displayName
      }
    })

    return collectionsObj
  },
sortFunc: (data, sortKey, sortOrder) => {
  return data.sort((a, b) => {
    if(typeof a[sortKey] ==='number')
    return (sortOrder) * (a[sortKey] - b[sortKey]);
    if(typeof a[sortKey] ==='string')
    return (sortOrder) * (b[sortKey].localeCompare(a[sortKey]));
  })
},
async copyRequest(type, completeData) {
  let copyString = "";
  let snackBarMessage = ""
  completeData = JSON.parse(completeData);
  if (type=="RESPONSE") {
    let responsePayload = {}
    let responseHeaders = {}
    let statusCode = 0

    if (completeData) {
      responsePayload = completeData["response"] ?  completeData["response"]["body"] : completeData["responsePayload"]
      responseHeaders = completeData["response"] ?  completeData["response"]["headers"] : completeData["responseHeaders"]
      statusCode = completeData["response"] ?  completeData["response"]["statusCode"] : completeData["statusCode"]
    }
    let b = {
      "responsePayload": responsePayload,
      "responseHeaders": responseHeaders,
      "statusCode": statusCode
    }

    copyString = JSON.stringify(b)
    snackBarMessage = "Response data copied to clipboard"
  } else {
    if (type === "CURL") { 
      snackBarMessage = "Curl request copied to clipboard"
      let resp = await inventoryApi.convertSampleDataToCurl(JSON.stringify(completeData))
      copyString = resp.curlString
    } else {
      snackBarMessage = "Burp request copied to clipboard"
      let resp = await inventoryApi.convertSampleDataToBurpRequest(JSON.stringify(completeData))
      copyString = resp.burpRequest
    }
  }
  return {copyString, snackBarMessage};
}

}

export default func