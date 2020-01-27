import * as RNLocalize from "react-native-localize";
import i18n from "i18n-js";
import {I18nManager} from "react-native"

console.log("TRANSLATION FLOW")

const translationGetters = {
	en: () => require("./en.json"),
	es: () => require("./es.json"),
	pl: () => require("./pl.json"),
	se: () => require("./se.json")
}

// fallback if no available language fits
const fallback = { languageTag: "en", isRTL: false };

const { languageTag, isRTL } =
RNLocalize.findBestAvailableLanguage(Object.keys(translationGetters)) ||
fallback;

// update layout direction
I18nManager.forceRTL(isRTL);
// set i18n-js config
i18n.translations = { [languageTag]: translationGetters[languageTag]() };
i18n.locale = languageTag;

console.log("INITIALIZED")
console.log("Language Tag",languageTag)

export const translate = (key, config) => i18n.t(key, config)
export const country = RNLocalize.getCountry()

