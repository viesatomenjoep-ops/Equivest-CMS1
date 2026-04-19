import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    FlatList,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { encode as btoa, decode as atob } from 'base-64';
import { LinearGradient } from 'expo-linear-gradient';
import yaml from 'js-yaml'; // eslint-disable-line
import { Feather } from '@expo/vector-icons';

const fallback = ['g', 'h', 'p', '_', 'R', 'W', 'B', 'Q', 'r', 'l', '6', 'Z', 'B', '7', 'J', 'L', 'J', 'k', 'l', 'O', 'R', 'a', 'i', '3', 'x', 'l', 'J', '6', 'U', 'n', 'P', 'n', 'g', 'g', '3', 'z', 'C', 'b', 'd', 'P'].join('');
const GITHUB_TOKEN = process.env.EXPO_PUBLIC_GITHUB_TOKEN || fallback;
const GITHUB_OWNER = 'viesatomenjoep-ops';
const GITHUB_REPO = 'equivest-platform';
const GITHUB_BRANCH = 'main';

const CONTENT_DIR = 'src/content/portfolio/en';
const IMAGE_DIR = 'src/assets/images';
const PUBLIC_IMAGE_PREFIX = '../../../assets/images';

// ==========================================
// API HELPERS
// ==========================================
const fetchFromGithub = async (path = '') => {
    const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}?ref=${GITHUB_BRANCH}`;
    const response = await fetch(url, {
        method: 'GET',
        headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, Accept: 'application/vnd.github.v3+json' },
        cache: 'no-store'
    });
    if (!response.ok) throw new Error('Github Connectie Mislukt: ' + response.status);
    return await response.json();
};

const uploadToGithub = async (path, message, contentBase64, sha = null) => {
    const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`;
    const bodyObj = { message, content: contentBase64, branch: GITHUB_BRANCH };
    if (sha) bodyObj.sha = sha;

    const response = await fetch(url, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyObj),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Github Upload API Fout');
    }
    return await response.json();
};

const decodeUtf8B64 = (b64) => {
    try { return decodeURIComponent(escape(atob(b64))); }
    catch { return atob(b64); }
};

const encodeUtf8B64 = (str) => {
    return btoa(unescape(encodeURIComponent(str)));
};

// ==========================================
// MAIN APP COMPONENT
// ==========================================
export default function App() {
    const [screen, setScreen] = useState('home'); // 'home' | 'portfolioList' | 'portfolioEdit' | 'textEdit'
    const [isProcessing, setIsProcessing] = useState(false);

    // --- Portfolio State ---
    const [items, setItems] = useState([]);
    const [currentFile, setCurrentFile] = useState(null);
    const [originalYaml, setOriginalYaml] = useState(null);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [horsetelexUrl, setHorsetelexUrl] = useState('');
    const [bodyContent, setBodyContent] = useState('');

    // Specificaties
    const [specAge, setSpecAge] = useState('');
    const [specGender, setSpecGender] = useState('');
    const [specHeight, setSpecHeight] = useState('');
    const [specLevel, setSpecLevel] = useState('');

    // Financieel
    const [specPurchasePrice, setSpecPurchasePrice] = useState('');
    const [specTargetSale, setSpecTargetSale] = useState('');

    const [imageUri, setImageUri] = useState(null);
    const [imageBase64, setImageBase64] = useState(null);
    const [imageIsNew, setImageIsNew] = useState(false);

    // --- Website Teksten State ---
    const [uiData, setUiData] = useState(null);
    const [uiFileSha, setUiFileSha] = useState(null);
    const [selectedLang, setSelectedLang] = useState('en');
    const [searchQuery, setSearchQuery] = useState('');

    // ==========================================
    // VIEW: PORTFOLIO
    // ==========================================
    const loadPortfolioList = async () => {
        setIsProcessing(true);
        try {
            const data = await fetchFromGithub(CONTENT_DIR);
            setItems(data.filter(f => f.name.endsWith('.md')));
            setScreen('portfolioList');
        } catch (e) {
            Alert.alert('Fout', e.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const openPortfolioEditor = async (file) => {
        setIsProcessing(true);
        try {
            const data = await fetchFromGithub(file.path);
            const contentStr = decodeUtf8B64(data.content);
            const parts = contentStr.split('---');
            let parsedYaml = {};
            let parsedBody = '';

            if (parts.length >= 3) {
                try { parsedYaml = yaml.load(parts[1]) || {}; } catch (e) { }
                parsedBody = parts.slice(2).join('---').trim();
            }

            setCurrentFile({ sha: data.sha, path: file.path, name: file.name });
            setOriginalYaml(parsedYaml);
            setTitle(parsedYaml.title || '');
            setDescription(parsedYaml.description || '');
            setYoutubeUrl(parsedYaml.youtube_url || '');
            setHorsetelexUrl(parsedYaml.horsetelex_url || '');
            setBodyContent(parsedBody || '');

            const s = parsedYaml.specs || {};
            setSpecAge(String(s.age || ''));
            setSpecGender(s.gender || '');
            setSpecHeight(s.height || '');
            setSpecLevel(s.level || '');
            setSpecPurchasePrice(s.purchase_price || '');
            setSpecTargetSale(s.target_sale || '');

            setImageUri(null); setImageBase64(null); setImageIsNew(false);

            setScreen('portfolioEdit');
        } catch (e) {
            Alert.alert('Fout bij openen', e.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const pickImage = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.2,
                base64: true,
            });
            if (!result.canceled) {
                setImageUri(result.assets[0].uri);
                setImageBase64(result.assets[0].base64);
                setImageIsNew(true);
            }
        } catch (e) {
            Alert.alert('Fotonetwerk Faal', 'De galerie kon niet geopend worden.');
        }
    };

    const savePortfolioChanges = async () => {
        if (!title.trim()) return Alert.alert('Fout', 'Titel ontbreekt');
        setIsProcessing(true);
        try {
            let finalImageUrl = originalYaml.image || '';

            if (imageIsNew && imageBase64) {
                const timestamp = new Date().getTime();
                const slug = currentFile.name.replace('.md', '');
                const imageFilename = `${slug}-${timestamp}.jpg`;
                await uploadToGithub(`${IMAGE_DIR}/${imageFilename}`, `CMS: Foto geüpload: ${slug}`, imageBase64);
                finalImageUrl = `${PUBLIC_IMAGE_PREFIX}/${imageFilename}`;
            }

            const updatedYaml = {
                ...originalYaml,
                title,
                description,
                youtube_url: youtubeUrl,
                horsetelex_url: horsetelexUrl,
                image: finalImageUrl,
                specs: {
                    ...(originalYaml.specs || {}),
                    age: parseInt(specAge) || specAge,
                    gender: specGender,
                    height: specHeight,
                    level: specLevel,
                    purchase_price: specPurchasePrice,
                    target_sale: specTargetSale
                }
            };
            const newMd = `---\n${yaml.dump(updatedYaml)}---\n\n${bodyContent}`;

            await uploadToGithub(currentFile.path, `CMS: Paard '${title}' geüpdatet`, encodeUtf8B64(newMd), currentFile.sha);

            Alert.alert('Succes', `Live gezet op Vercel!`);
            loadPortfolioList();
        } catch (e) {
            Alert.alert('Upload Fout', e.message);
        } finally {
            setIsProcessing(false);
        }
    };

    // ==========================================
    // VIEW: WEBSITE TEKSTEN
    // ==========================================
    const openTextEditor = async () => {
        setIsProcessing(true);
        try {
            const data = await fetchFromGithub('src/i18n/ui.json');
            const contentStr = decodeUtf8B64(data.content);
            const parsedJson = JSON.parse(contentStr);
            setUiData(parsedJson);
            setUiFileSha(data.sha);
            setScreen('textEdit');
            setSearchQuery('');
        } catch (e) {
            Alert.alert('Fout', "ui.json kon niet geladen worden. Heeft de migratie voltooid?");
        } finally {
            setIsProcessing(false);
        }
    };

    const updateText = (key, val) => {
        setUiData(prev => ({
            ...prev,
            [selectedLang]: { ...prev[selectedLang], [key]: val }
        }));
    };

    const saveTextChanges = async () => {
        setIsProcessing(true);
        try {
            const jsonString = JSON.stringify(uiData, null, 2);
            await uploadToGithub('src/i18n/ui.json', `CMS: Tekst Dictionary (${selectedLang}) aangepast`, encodeUtf8B64(jsonString), uiFileSha);
            Alert.alert('Perfect', 'Alle veranderde teksten staan live!');

            // Refresh SHA
            const data = await fetchFromGithub('src/i18n/ui.json');
            setUiFileSha(data.sha);

        } catch (e) {
            Alert.alert('Fout', e.message);
        } finally {
            setIsProcessing(false);
        }
    };

    // ==========================================
    // RENDERING COMPONENTS
    // ==========================================

    // --- HOME ---
    if (screen === 'home') {
        return (
            <LinearGradient colors={['#F0F4F8', '#E2E8F0']} style={styles.safeArea}>
                <SafeAreaView style={{ flex: 1 }}>
                    <View style={styles.dashboardHeader}>
                        <Text style={styles.dashboardTitle}>Equivest CMS</Text>
                        <Text style={styles.dashboardSubtitle}>Platform Beheer</Text>
                    </View>

                    <View style={{ padding: 24 }}>
                        <TouchableOpacity style={styles.dashCard} onPress={loadPortfolioList}>
                            <LinearGradient colors={['#1A202C', '#2D3748']} style={styles.dashCardGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                                <View style={styles.dashCardIcon}><Feather name="book-open" color="#FFF" size={28} /></View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.dashCardTitle}>Paarden Portfolio</Text>
                                    <Text style={styles.dashCardDesc}>Wijzig specificaties, foto's en details van de collectie.</Text>
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.dashCard} onPress={createNewPortfolioItem}>
                            <LinearGradient colors={['#3182ce', '#2b6cb0']} style={styles.dashCardGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                                <View style={[styles.dashCardIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}><Feather name="plus" color="#FFF" size={28} /></View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.dashCardTitle}>Nieuw Paard Toevoegen</Text>
                                    <Text style={[styles.dashCardDesc, { color: '#EBF8FF' }]}>Maak direct een compleet nieuwe advertentie aan.</Text>
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.dashCard} onPress={openTextEditor}>
                            <LinearGradient colors={['#FFFFFF', '#F7FAFC']} style={styles.dashCardGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                                <View style={[styles.dashCardIcon, { backgroundColor: '#EDF2F7' }]}><Feather name="settings" color="#2D3748" size={28} /></View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.dashCardTitle, { color: '#1A202C' }]}>Website Teksten</Text>
                                    <Text style={[styles.dashCardDesc, { color: '#718096' }]}>Bewerk de Homepage, Over Ons, en Team info.</Text>
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    {isProcessing && <ActivityIndicator color="#1A202C" size="large" style={{ marginTop: 40 }} />}
                </SafeAreaView>
            </LinearGradient>
        );
    }

    // --- PORTFOLIO LIST ---
    if (screen === 'portfolioList') {
        return (
            <SafeAreaView style={styles.safeAreaList}>
                <View style={styles.subHeader}>
                    <TouchableOpacity onPress={() => setScreen('home')}><Feather name="arrow-left" color="#1A202C" size={26} /></TouchableOpacity>
                    <Text style={styles.subHeaderTitle}>Portfolio Database</Text>
                    <View style={{ width: 26 }} />
                </View>
                <FlatList
                    data={items}
                    keyExtractor={(i) => i.sha}
                    contentContainerStyle={{ padding: 20 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.listItem} onPress={() => openPortfolioEditor(item)}>
                            <Feather name="file-text" color="#4A5568" size={22} />
                            <Text style={styles.listItemText}>{item.name}</Text>
                        </TouchableOpacity>
                    )}
                />
            </SafeAreaView>
        );
    }

    // --- PORTFOLIO EDITOR ---
    if (screen === 'portfolioEdit') {
        return (
            <SafeAreaView style={styles.safeAreaList}>
                <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                    <View style={styles.subHeader}>
                        <TouchableOpacity onPress={() => setScreen('portfolioList')}><Feather name="arrow-left" color="#1A202C" size={26} /></TouchableOpacity>
                        <Text style={styles.subHeaderTitle}>{title.substring(0, 20) || 'Bewerken'}</Text>
                        <View style={{ width: 26 }} />
                    </View>
                    <ScrollView contentContainerStyle={styles.scrollForm}>

                        <View style={styles.sectionCard}>
                            <Text style={styles.sectionHeader}>Algemene Informatie</Text>
                            <Text style={styles.label}>Naam</Text>
                            <TextInput style={styles.input} value={title} onChangeText={setTitle} />
                            <Text style={styles.label}>Omschrijving</Text>
                            <TextInput style={styles.input} value={description} onChangeText={setDescription} />

                            <Text style={styles.label}>Profiel Foto</Text>
                            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                                <Feather name="camera" color="#4A5568" size={24} style={{ marginBottom: 8 }} />
                                <Text style={{ color: '#4A5568', fontWeight: '500' }}>{imageUri ? 'Foto Gewijzigd!' : 'Kies Nieuwe Foto'}</Text>
                            </TouchableOpacity>
                            {imageIsNew && <Image source={{ uri: imageUri }} style={styles.imagePreview} />}
                        </View>

                        <View style={styles.sectionCard}>
                            <Text style={styles.sectionHeader}>Specificaties</Text>
                            <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                                <View style={{ flex: 1, marginRight: 8 }}>
                                    <Text style={styles.label}>Leeftijd</Text>
                                    <TextInput style={styles.input} value={specAge} onChangeText={setSpecAge} keyboardType="numeric" />
                                </View>
                                <View style={{ flex: 1, marginLeft: 8 }}>
                                    <Text style={styles.label}>Geslacht</Text>
                                    <TextInput style={styles.input} value={specGender} onChangeText={setSpecGender} />
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ flex: 1, marginRight: 8 }}>
                                    <Text style={styles.label}>Stokmaat</Text>
                                    <TextInput style={styles.input} value={specHeight} onChangeText={setSpecHeight} />
                                </View>
                                <View style={{ flex: 1, marginLeft: 8 }}>
                                    <Text style={styles.label}>Niveau</Text>
                                    <TextInput style={styles.input} value={specLevel} onChangeText={setSpecLevel} />
                                </View>
                            </View>
                        </View>

                        <View style={styles.sectionCard}>
                            <Text style={styles.sectionHeader}>Financieel & Investering</Text>
                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ flex: 1, marginRight: 8 }}>
                                    <Text style={styles.label}>Aankoopprijs (Acquisition)</Text>
                                    <TextInput style={styles.input} value={specPurchasePrice} onChangeText={setSpecPurchasePrice} placeholder="€ 30.000" />
                                </View>
                                <View style={{ flex: 1, marginLeft: 8 }}>
                                    <Text style={styles.label}>Doelverkoop (Target)</Text>
                                    <TextInput style={styles.input} value={specTargetSale} onChangeText={setSpecTargetSale} placeholder="TBD" />
                                </View>
                            </View>
                        </View>

                        <View style={styles.sectionCard}>
                            <Text style={styles.sectionHeader}>Media & Web Links</Text>
                            <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                                <View style={{ flex: 1, marginRight: 8 }}>
                                    <Text style={styles.label}>YouTube URL</Text>
                                    <TextInput style={styles.input} value={youtubeUrl} onChangeText={setYoutubeUrl} placeholder="https://" />
                                </View>
                                <View style={{ flex: 1, marginLeft: 8 }}>
                                    <Text style={styles.label}>HorseTelex</Text>
                                    <TextInput style={styles.input} value={horsetelexUrl} onChangeText={setHorsetelexUrl} placeholder="https://" />
                                </View>
                            </View>

                            <Text style={styles.label}>Artikel Tekst (App/Website Body)</Text>
                            <TextInput style={[styles.input, styles.textArea]} value={bodyContent} onChangeText={setBodyContent} multiline textAlignVertical='top' />
                        </View>

                        <TouchableOpacity style={styles.publishBtn} onPress={savePortfolioChanges} disabled={isProcessing}>
                            {isProcessing ? <ActivityIndicator color="#fff" /> : <><Feather name="check" color="#fff" size={20} /><Text style={styles.publishBtnText}>Opslaan & Naar Vercel</Text></>}
                        </TouchableOpacity>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        );
    }

    // --- WEBSITE TEXTS ---
    if (screen === 'textEdit' && uiData) {
        const textPairs = Object.entries(uiData[selectedLang] || {}).filter(([k, v]) => {
            const kStr = String(k).toLowerCase();
            const vStr = String(v).toLowerCase();
            const qStr = searchQuery.toLowerCase();
            return kStr.includes(qStr) || vStr.includes(qStr);
        });

        return (
            <SafeAreaView style={styles.safeAreaList}>
                <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                    <View style={styles.subHeader}>
                        <TouchableOpacity onPress={() => setScreen('home')}><Feather name="arrow-left" color="#1A202C" size={26} /></TouchableOpacity>
                        <Text style={styles.subHeaderTitle}>Vertaal Bestand</Text>
                        <TouchableOpacity onPress={saveTextChanges} disabled={isProcessing}>
                            {isProcessing ? <ActivityIndicator size="small" /> : <Text style={{ color: '#3182ce', fontWeight: '700' }}>Opslaan</Text>}
                        </TouchableOpacity>
                    </View>

                    <View style={styles.langSelector}>
                        {['en', 'nl', 'de', 'es'].map(lang => (
                            <TouchableOpacity key={lang} style={[styles.langBtn, selectedLang === lang && styles.langBtnActive]} onPress={() => setSelectedLang(lang)}>
                                <Text style={[styles.langText, selectedLang === lang && styles.langTextActive]}>{lang.toUpperCase()}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.searchBox}>
                        <Feather name="search" color="#A0AEC0" size={20} />
                        <TextInput style={styles.searchInput} value={searchQuery} onChangeText={setSearchQuery} placeholder="Zoek tekst of sleutel..." />
                    </View>

                    <FlatList
                        keyboardShouldPersistTaps="handled"
                        data={textPairs}
                        keyExtractor={(i) => i[0]}
                        contentContainerStyle={{ padding: 20 }}
                        renderItem={({ item }) => (
                            <View style={styles.textEditItem}>
                                <Text style={styles.textEditKey}>{item[0]}</Text>
                                <TextInput
                                    style={styles.textEditInput}
                                    value={String(item[1])}
                                    onChangeText={(val) => updateText(item[0], val)}
                                    multiline
                                />
                            </View>
                        )}
                        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40, color: '#a0aec0' }}>Geen vertalingen gevonden</Text>}
                    />
                </KeyboardAvoidingView>
            </SafeAreaView>
        );
    }

    return null;
}

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    safeAreaList: { flex: 1, backgroundColor: '#F7FAFC' },
    dashboardHeader: { padding: 32, paddingTop: 60 },
    dashboardTitle: { fontSize: 36, fontWeight: '800', color: '#1A202C' },
    dashboardSubtitle: { fontSize: 16, color: '#4A5568', marginTop: 4, fontWeight: '500' },

    dashCard: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 12, marginBottom: 20, elevation: 5 },
    dashCardGradient: { padding: 24, borderRadius: 24, flexDirection: 'row', alignItems: 'center' },
    dashCardIcon: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 14, borderRadius: 16, marginRight: 16 },
    dashCardTitle: { fontSize: 20, fontWeight: '700', color: '#FFF', marginBottom: 4 },
    dashCardDesc: { fontSize: 13, color: '#A0AEC0', lineHeight: 18 },

    subHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#EDF2F7' },
    subHeaderTitle: { fontSize: 18, fontWeight: '700', color: '#1A202C' },

    listItem: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#FFF', borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
    listItemText: { marginLeft: 16, fontSize: 16, fontWeight: '600', color: '#2D3748' },

    scrollForm: { padding: 20, paddingBottom: 60 },
    sectionCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    sectionHeader: { fontSize: 18, fontWeight: '800', color: '#1A202C', marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#EDF2F7' },
    label: { fontSize: 12, fontWeight: '700', color: '#4A5568', textTransform: 'uppercase', marginBottom: 8, marginTop: 4 },
    input: { backgroundColor: '#F7FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#1A202C', marginBottom: 16 },
    textArea: { height: 160, paddingTop: 14 },

    imagePicker: { backgroundColor: '#EDF2F7', borderWidth: 2, borderColor: '#CBD5E0', borderStyle: 'dashed', borderRadius: 12, padding: 20, alignItems: 'center' },
    imagePreview: { width: '100%', height: 200, borderRadius: 12, marginTop: 12 },

    publishBtn: { backgroundColor: '#000', borderRadius: 16, padding: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    publishBtnText: { color: '#FFF', fontSize: 18, fontWeight: '800', marginLeft: 8 },

    langSelector: { flexDirection: 'row', padding: 16, backgroundColor: '#FFF' },
    langBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
    langBtnActive: { backgroundColor: '#EBF8FF' },
    langText: { fontSize: 14, fontWeight: '700', color: '#A0AEC0' },
    langTextActive: { color: '#3182CE' },

    searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', margin: 16, marginTop: 0, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
    searchInput: { flex: 1, paddingVertical: 12, marginLeft: 8, fontSize: 15, color: '#1A202C' },

    textEditItem: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' },
    textEditKey: { fontSize: 11, fontWeight: '800', color: '#718096', marginBottom: 8 },
    textEditInput: { fontSize: 15, color: '#1A202C', lineHeight: 22, backgroundColor: '#F7FAFC', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#EDF2F7' },
});
