import React from 'react'
import TokensLayout from './TokensLayout'
import globalFunctions from '@/util/func';

function ApiTokens() {
    let cardContent = "Seamlessly enhance your web application security with Akto API integration, empowering you to efficiently detect vulnerabilities, analyze and intercept web traffic, and fortify your digital defenses.  "
  return (
    <TokensLayout type={globalFunctions.testingResultType().EXTERNAL_API} title="Akto API" cardContent={cardContent} />
  )
}

export default ApiTokens