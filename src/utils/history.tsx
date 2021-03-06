import React from "react";
import NavBar from "@components/navbar";

const createHistory = require("history").createBrowserHistory;

declare const BASENAME: string;

const history = createHistory({
    basename: BASENAME ? `/${BASENAME}` : "/"
});
history.listen((location, action) => {
    console.log("history update=>", location, action);
    // @ts-ignore
    if (window.ReactNativeWebView) {
        // @ts-ignore
        window.ReactNativeWebView.postMessage(
            JSON.stringify({
                type: "historyUpdated"
            })
        );
    }
});

export default history;
export const withNavBar = (WrappedCompnented, title?: string) => props => {
    const { goBack, canGoBack } = WrappedCompnented;
    let hasNavbar = history.length > 1;

    if (canGoBack && typeof canGoBack === "function") {
        hasNavbar = hasNavbar && canGoBack();
    }
    return (
        <>
            <div style={{ marginTop: "35px" }}>
                <WrappedCompnented {...props} />
            </div>
            <NavBar
                title={title}
                hide={!hasNavbar}
                onLeftClick={() => {
                    if (goBack) {
                        goBack();
                    } else {
                        history.go(-1);
                    }
                }}
            />
        </>
    );
};
