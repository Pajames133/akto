import { TopBar, Icon, Text, ActionList, Modal, TextField, HorizontalStack, Box, Avatar, VerticalStack, Button } from '@shopify/polaris';
import { NotificationMajor, CustomerPlusMajor, LogOutMinor, NoteMinor, ResourcesMajor, UpdateInventoryMajor, PageMajor, DynamicSourceMajor } from '@shopify/polaris-icons';
import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Store from '../../../store';
import PersistStore from '../../../../main/PersistStore';
import './Headers.css'
import api from '../../../../signup/api';
import func from '@/util/func';
import SemiCircleProgress from '../../shared/SemiCircleProgress';
import { usePolling } from '../../../../main/PollingProvider';
import { debounce } from 'lodash';
import LocalStore from '../../../../main/LocalStorageStore';

function ContentWithIcon({icon,text, isAvatar= false}) {
    return(
        <HorizontalStack gap={2}>
            <Box width='20px'>
                {isAvatar ? <div className='reduce-size'><Avatar size="extraSmall" source={icon} /> </div>:
                <Icon source={icon} color="base" />}
            </Box>
            <Text>{text}</Text>
        </HorizontalStack>
    )
}

export default function Header() {
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [newAccount, setNewAccount] = useState('')
    const [showCreateAccount, setShowCreateAccount] = useState(false)
    const { currentTestsObj, clearPollingInterval } = usePolling();
    const navigate = useNavigate()

    const username = Store((state) => state.username)
    const storeAccessToken = PersistStore(state => state.storeAccessToken)
    const accounts = Store(state => state.accounts)
    const activeAccount = Store(state => state.activeAccount)
    const resetAll = PersistStore(state => state.resetAll)
    const resetStore = LocalStore(state => state.resetStore)

    const allRoutes = Store((state) => state.allRoutes)
    const allCollections = PersistStore((state) => state.allCollections)
    const searchItemsArr = useMemo(() => func.getSearchItemsArr(allRoutes, allCollections), [])
    const [filteredItemsArr, setFilteredItemsArr] = useState(searchItemsArr)
    const toggleIsUserMenuOpen = useCallback(
        () => setIsUserMenuOpen((isUserMenuOpen) => !isUserMenuOpen),
        [],
    );

    const handleLogOut = async () => { 
        clearPollingInterval()
        api.logout().then(res => {
            resetAll();
            resetStore() ;
            storeAccessToken(null)
            if(res.logoutUrl){
                window.location.href = res.logoutUrl
            } else {
                navigate("/login")
            }
        }).catch(err => {
            navigate("/");
        })
    }

    const debouncedSearch = debounce((searchQuery) => {
        if(searchQuery.length === 0){
            setFilteredItemsArr(searchItemsArr)
        }else{
            const resultArr = searchItemsArr.filter((x) => x.content.toLowerCase().includes(searchQuery))
            setFilteredItemsArr(resultArr)
        }
    }, 500);

    const accountsItems = Object.keys(accounts).map(accountId => {
        return {
            id: accountId,
            content: (<div style={{ color: accountId === activeAccount.toString() ? "var(--akto-primary)" :  "var(--p-text)"  }}>{accounts[accountId]}</div>),
            onAction: async () => {
                await api.goToAccount(accountId)
                func.setToast(true, false, `Switched to account ${accounts[accountId]}`)
                resetAll();
                resetStore();
                window.location.href = '/dashboard/observe/inventory'
            }
        }
    })

    function createNewAccount() {
        api.saveToAccount(newAccount).then(resp => {
          setShowCreateAccount(false)
          setNewAccount('')
          resetAll();
          resetStore();
          window.location.href="/dashboard/onboarding"
        })
    }

    const userMenuMarkup = (
        <TopBar.UserMenu
            actions={[
                {
                    items: accountsItems
                },
                {
                    items: [
                        (window.IS_SAAS !== "true" && (window?.DASHBOARD_MODE === 'LOCAL_DEPLOY' || window?.DASHBOARD_MODE === "ON_PREM")) ? {} :
                        { id: "create_account", content: <ContentWithIcon icon={CustomerPlusMajor} text={"Create account"} />, onAction: () => setShowCreateAccount(true)},
                        // { id: "manage", content: 'Manage account' },
                        { id: "log-out", content: <ContentWithIcon icon={LogOutMinor} text={"Logout"} /> , onAction: handleLogOut }
                    ],
                },
                {
                    items: [
                        { content: <ContentWithIcon text={"Documentation"} icon={NoteMinor} />, onAction: () => { window.open("https://docs.akto.io/readme") } },
                        { content: <ContentWithIcon text={"Tutorials"} icon={ResourcesMajor}/>, onAction: () => { window.open("https://www.youtube.com/@aktodotio") } },
                        { content: <ContentWithIcon icon={UpdateInventoryMajor} text={"Changelog"} />, onAction: () => { window.open("https://app.getbeamer.com/akto/en") } },
                        { content: <ContentWithIcon icon="/public/discord.svg" text={"Discord Support"} isAvatar={true}/>, onAction: () => { window.open("https://discord.com/invite/Wpc6xVME4s") } },
                        { content: <ContentWithIcon icon="/public/github_icon.svg" text={"Star On Github"} isAvatar={true}/>, onAction: () => { window.open("https://github.com/akto-api-security/akto") } }
                    ],
                },
            ]}
            initials={func.initials(username)}
            open={isUserMenuOpen}
            onToggle={toggleIsUserMenuOpen}
        />
    );

    const handleSearchChange = useCallback((value) => {
        setSearchValue(value);
        debouncedSearch(value.toLowerCase())
    }, []);

    const handleNavigateSearch = (url) => {
        navigate(url)
        handleSearchChange('')
    }

    const searchItems = filteredItemsArr.slice(0,20).map((item) => {
        const icon = item.type === 'page' ? PageMajor : DynamicSourceMajor;
        return {
            value: item.content,
            content: <ContentWithIcon text={item.content} icon={icon} />,
            onAction: () => handleNavigateSearch(item.url),
        }
    })

    const searchResultsMarkup = (
        <ActionList
            items={searchItems}
        />
    );

    const searchFieldMarkup = (
        <TopBar.SearchField
            placeholder="Search for API collections"
            showFocusBorder
            onChange={handleSearchChange}
            value={searchValue}
        />
    );

    const handleTestingNavigate = () => {
        let navUrl = "/dashboard/testing"
        if(currentTestsObj.testRunsArr.length === 1){
            navUrl = navUrl + "/" + currentTestsObj.testRunsArr[0].testingRunId
        }
        navigate(navUrl)
    }

    const progress = useMemo(() => {
        return currentTestsObj.totalTestsInitiated === 0 ? 0 : Math.floor((currentTestsObj.totalTestsCompleted * 100) / currentTestsObj.totalTestsInitiated);
    }, [currentTestsObj.totalTestsCompleted, currentTestsObj.totalTestsInitiated]);


    const secondaryMenuMarkup = (
        <HorizontalStack gap={"4"}>
            {(Object.keys(currentTestsObj).length > 0 && currentTestsObj?.testRunsArr?.length !== 0) ? 
            <HorizontalStack gap={"2"}>
                <Button plain monochrome onClick={() => {handleTestingNavigate()}}>
                 <SemiCircleProgress key={"progress"} progress={progress} size={60} height={55} width={75}/>
                </Button>
                <VerticalStack gap={"0"}>
                    <Text fontWeight="medium">Test run status</Text>
                    <Text color="subdued" variant="bodySm">{`${currentTestsObj.totalTestsQueued} tests queued`}</Text>
                </VerticalStack>
            </HorizontalStack> : null}
             <TopBar.Menu
                activatorContent={
                    <span id="beamer-btn">
                        <Icon source={NotificationMajor} />
                    </span>
                }
                actions={[]}
            />
        </HorizontalStack>
        
    );

    const topBarMarkup = (
        <div className='topbar'>
            <TopBar
                showNavigationToggle
                userMenu={userMenuMarkup}
                searchField={searchFieldMarkup}
                searchResultsVisible={searchValue.length > 0}
                searchResults={searchResultsMarkup}
                onSearchResultsDismiss={() =>handleSearchChange('')}
                secondaryMenu={secondaryMenuMarkup}
            />
            <Modal
                open={showCreateAccount}
                onClose={() => setShowCreateAccount(false)}
                title="Create new account"
                primaryAction={{
                    content: 'Create',
                    onAction: createNewAccount,
                }}
            >
                <Modal.Section>

                    <TextField
                        id="create-account-name"
                        label="Name"
                        helpText="Enter name for new account"
                        value={newAccount}
                        onChange={(input) => setNewAccount(input)}
                        autoComplete="off"
                        maxLength="24"
                       
                        autoFocus
                    />


                </Modal.Section>
            </Modal>
        </div>
    );

    return (
        topBarMarkup
    );
}