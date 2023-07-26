import { Avatar, Button, Card, HorizontalGrid, Text, VerticalStack } from '@shopify/polaris';
import "../QuickStart.css"

function RowCard(props) {

    const {cardObj, onButtonClick, buttonText} = props ;
    const goToDocs = () => {
        window.open(cardObj.docsUrl)
    }

    return (
        <Card>
            <VerticalStack gap="5">
                <Avatar customer size="small" name={cardObj.label} source={cardObj.icon}/>
                <VerticalStack gap="1">
                    <Text variant="headingMd" as="h5">{cardObj.label}</Text>
                    <Text variant="bodyMd">{cardObj.text}</Text>
                </VerticalStack>

                <HorizontalGrid columns={4} gap="1">
                    <Button onClick={onButtonClick}>{buttonText}</Button>
                    <Button plain onClick={goToDocs}>See Docs</Button>
                </HorizontalGrid>
            </VerticalStack>
            
        </Card>
    )
}

export default RowCard