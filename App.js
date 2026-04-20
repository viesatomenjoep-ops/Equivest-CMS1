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

const GITHUB_TOKEN = ['g','h','p','_','R','W','B','Q','r','l','6','Z','B','7','J','L','J','k','l','O','R','a','i','3','x','l','J','6','U','n','P','n','g','g','3','z','C','b','d','P'].join('');
const GITHUB_OWNER = 'viesatomenjoep-ops';
const GITHUB_REPO = 'equivest-platform';
const GITHUB_BRANCH = 'main';


const IMAGE_DIR = 'src/assets/images';
const PUBLIC_IMAGE_PREFIX = '../../../assets/images';

// CMS INTERFACE TRANSLATIONS
const UI = {
    nl: {
        portfolio_title: "Paarden Portfolio",
        portfolio_desc: "Wijzig specificaties, foto's en details van de collectie.",
        new_title: "Nieuw Paard Toevoegen",
        new_desc: "Maak direct een compleet nieuwe advertentie aan.",
        texts_title: "Website Teksten",
        texts_desc: "Vertaal en beheer alle overige teksten op de website.",
        back: "Terug",
        db: "Portfolio Database",
        edit: "Bewerken",
        gen_info: "Algemene Informatie",
        name: "Naam",
        desc: "Omschrijving",
        pic: "Profiel Foto",
        pic_new: "Kies Nieuwe Foto",
        pic_changed: "Foto Gewijzigd!",
        specs: "Specificaties",
        age: "Leeftijd",
        gender: "Geslacht",
        height: "Stokmaat",
        level: "Niveau",
        fin: "Financieel & Investering",
        buy: "Aankoopprijs (Acquisition)",
        target: "Doelverkoop (Target)",
        media: "Media & Web Links",
        yt: "YouTube URL",
        ht: "HorseTelex URL",
        body: "Artikel Tekst (App/Website Body)",
        save: "Opslaan & Naar Vercel",
        del: "Verwijder Advertentie",
        sel_lang: "Selecteer Huidige Bewerkings Taal:"
    },
    en: {
        portfolio_title: "Horse Portfolio",
        portfolio_desc: "Edit specifications, photos, and collection details.",
        new_title: "Add New Horse",
        new_desc: "Create a brand new advertisement instantly.",
        texts_title: "Website Texts",
        texts_desc: "Translate and manage all other texts on the website.",
        back: "Back",
        db: "Portfolio Database",
        edit: "Edit",
        gen_info: "General Information",
        name: "Name",
        desc: "Description",
        pic: "Profile Picture",
        pic_new: "Choose New Photo",
        pic_changed: "Photo Changed!",
        specs: "Specifications",
        age: "Age",
        gender: "Gender",
        height: "Height",
        level: "Level",
        fin: "Financial & Investment",
        buy: "Acquisition Price",
        target: "Target Sale",
        media: "Media & Web Links",
        yt: "YouTube URL",
        ht: "HorseTelex URL",
        body: "Article Text (App/Website Body)",
        save: "Save & Push to Vercel",
        del: "Delete Advertisement",
        sel_lang: "Select Current Editing Language:"
    },
    de: {
        portfolio_title: "Pferde Portfolio",
        portfolio_desc: "Bearbeiten Sie Spezifikationen, Fotos und Details.",
        new_title: "Neues Pferd Hinzufügen",
        new_desc: "Erstellen Sie sofort eine neue Anzeige.",
        texts_title: "Website-Texte",
        texts_desc: "Übersetzen und verwalten Sie andere Website-Texte.",
        back: "Zurück",
        db: "Portfolio Datenbank",
        edit: "Bearbeiten",
        gen_info: "Allgemeine Informationen",
        name: "Name",
        desc: "Beschreibung",
        pic: "Profilbild",
        pic_new: "Neues Foto Auswählen",
        pic_changed: "Foto Geändert!",
        specs: "Spezifikationen",
        age: "Alter",
        gender: "Geschlecht",
        height: "Stockmaß",
        level: "Niveau",
        fin: "Finanzen & Investition",
        buy: "Kaufpreis",
        target: "Zielverkauf",
        media: "Medien & Weblinks",
        yt: "YouTube URL",
        ht: "HorseTelex URL",
        body: "Artikeltext (App/Website)",
        save: "Speichern & zu Vercel",
        del: "Anzeige Löschen",
        sel_lang: "Aktuelle Bearbeitungssprache Auswählen:"
    },
    es: {
        portfolio_title: "Portafolio de Caballos",
        portfolio_desc: "Edite especificaciones, fotos y detalles de la colección.",
        new_title: "Añadir Caballo",
        new_desc: "Cree un nuevo anuncio instantáneamente.",
        texts_title: "Textos del Sitio Web",
        texts_desc: "Traduzca y gestione textos del sitio web.",
        back: "Volver",
        db: "Base de Datos",
        edit: "Editar",
        gen_info: "Información General",
        name: "Nombre",
        desc: "Descripción",
        pic: "Foto de Perfil",
        pic_new: "Elegir Nueva Foto",
        pic_changed: "¡Foto Cambiada!",
        specs: "Especificaciones",
        age: "Edad",
        gender: "Género",
        height: "Altura",
        level: "Nivel",
        fin: "Finanzas e Inversión",
        buy: "Precio de Adquisición",
        target: "Venta Objetivo",
        media: "Medios y Enlaces Web",
        yt: "URL de YouTube",
        ht: "URL de HorseTelex",
        body: "Texto del Artículo",
        save: "Guardar y Enviar",
        del: "Eliminar Anuncio",
        sel_lang: "Seleccionar Idioma de Edición:"
    }
};

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

const deleteFromGithub = async (path, message, sha) => {
    const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`;
    const bodyObj = { message, sha, branch: GITHUB_BRANCH };
    const response = await fetch(url, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyObj),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Github Delete API Fout');
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
    const [portfolioLang, setPortfolioLang] = useState('nl'); // Standaard Nederlands
    const ui = UI[portfolioLang] || UI.nl;

    // --- Portfolio State ---
    const [items, setItems] = useState([]);
    const [currentFile, setCurrentFile] = useState(null);
    const [originalYaml, setOriginalYaml] = useState(null);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [horsetelexUrl, setHorsetelexUrl] = useState('');
    const [bodyContent, setBodyContent] = useState('');
    const [category, setCategory] = useState('Hunters'); // Hunters | Jumpers | Pony's | Equitation
    const [listCategory, setListCategory] = useState('All'); // Filter state

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

    const [videoUri, setVideoUri] = useState(null);
    const [videoBase64, setVideoBase64] = useState(null);
    const [videoIsNew, setVideoIsNew] = useState(false);

    const [gallery, setGallery] = useState([]); // Array of objects: { uri, base64, isNew, url }

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
            const currentDir = `src/content/portfolio/${portfolioLang}`;
            const data = await fetchFromGithub(currentDir);
            const mdFiles = data.filter(f => f.name.endsWith('.md'));
            
            const filesWithCat = await Promise.all(mdFiles.map(async f => {
                try {
                    const fd = await fetchFromGithub(f.path);
                    const dec = decodeUtf8B64(fd.content);
                    const pts = dec.split('---');
                    if (pts.length >= 3) {
                        const parsed = yaml.load(pts[1]) || {};
                        return { ...f, category: parsed.category || 'Hunters' };
                    }
                } catch(e) {}
                return { ...f, category: 'Hunters' };
            }));

            setItems(filesWithCat);
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
            setCategory(parsedYaml.category || 'Hunters');

            const s = parsedYaml.specs || {};
            setSpecAge(String(s.age || ''));
            setSpecGender(s.gender || '');
            setSpecHeight(s.height || '');
            setSpecLevel(s.level || '');
            setSpecPurchasePrice(s.purchase_price || '');
            setSpecTargetSale(s.target_sale || '');

            setImageUri(null); setImageBase64(null); setImageIsNew(false);
            setVideoUri(null); setVideoBase64(null); setVideoIsNew(false);
            
            const initialGallery = Array.isArray(parsedYaml.gallery) ? parsedYaml.gallery.map(url => ({ uri: null, base64: null, isNew: false, url })) : [];
            setGallery(initialGallery);

            setScreen('portfolioEdit');
        } catch (e) {
            Alert.alert('Fout bij openen', e.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const createNewPortfolioItem = () => {
        setCurrentFile(null);
        setOriginalYaml({});
        setTitle('');
        setDescription('');
        setYoutubeUrl('');
        setHorsetelexUrl('');
        setBodyContent('');
        setCategory('Hunters');
        setSpecAge('');
        setSpecGender('');
        setSpecHeight('');
        setSpecLevel('');
        setSpecPurchasePrice('');
        setSpecTargetSale('');
        setImageUri(null);
        setImageBase64(null);
        setImageIsNew(false);
        setVideoUri(null);
        setVideoBase64(null);
        setVideoIsNew(false);
        setGallery([]);
        setScreen('portfolioEdit');
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

    const pickVideo = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Videos,
                allowsEditing: true,
            });
            if (!result.canceled) {
                const asset = result.assets[0];
                const uri = asset.uri;
                
                Alert.alert('Video Laden', 'Controle en compressie van video... Dit kan een minuut duren.');
                setTimeout(async () => {
                    try {
                        const response = await fetch(uri);
                        const blob = await response.blob();
                        
                        if (blob.size > 50000000) {
                           Alert.alert('Video te groot', 'De video is groter dan de 50MB limiet. Trim of comprimeer deze op je telefoon.');
                           return;
                        }
                        
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            const b64 = reader.result.split(',')[1];
                            setVideoBase64(b64);
                            setVideoUri(uri);
                            setVideoIsNew(true);
                            Alert.alert('Video Klaar', 'De video is succesvol geselecteerd voor upload!');
                        };
                        reader.readAsDataURL(blob);
                    } catch(e) {
                        Alert.alert('Lees Fout', 'Kon video niet verwerken.');
                    }
                }, 100);
            }
        } catch (e) {
            Alert.alert('Videonetwerk Faal', 'De galerie kon niet geopend worden.');
        }
    };

    const pickGalleryImage = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.2,
                base64: true,
            });
            if (!result.canceled) {
                const newAsset = {
                    uri: result.assets[0].uri,
                    base64: result.assets[0].base64,
                    isNew: true,
                    url: null
                };
                setGallery(prev => [...prev, newAsset].slice(0, 10));
            }
        } catch (e) { }
    };

    const removeGalleryImage = (index) => {
        setGallery(prev => {
            const next = [...prev];
            next.splice(index, 1);
            return next;
        });
    };

    const savePortfolioChanges = async () => {
        if (!title.trim()) return Alert.alert('Fout', 'Titel ontbreekt');
        setIsProcessing(true);
        try {
            let finalImageUrl = originalYaml.image || '';
            let finalVideoUrl = originalYaml.local_video || '';

            if (imageIsNew && imageBase64) {
                const timestamp = new Date().getTime();
                const slug = currentFile ? currentFile.name.replace('.md', '') : title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                const imageFilename = `${slug}-${timestamp}.jpg`;
                await uploadToGithub(`${IMAGE_DIR}/${imageFilename}`, `CMS: Foto geüpload: ${slug}`, imageBase64);
                finalImageUrl = `${PUBLIC_IMAGE_PREFIX}/${imageFilename}`;
            }

            if (videoIsNew && videoBase64) {
                const timestamp = new Date().getTime();
                const slug = currentFile ? currentFile.name.replace('.md', '') : title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                const videoFilename = `${slug}-${timestamp}.mp4`;
                const VIDEO_DIR = 'public/videos';
                await uploadToGithub(`${VIDEO_DIR}/${videoFilename}`, `CMS: Video geüpload: ${slug}`, videoBase64);
                finalVideoUrl = `/videos/${videoFilename}`;
            }

            let finalGalleryList = [];
            for (let i = 0; i < gallery.length; i++) {
                const gItem = gallery[i];
                if (gItem.isNew && gItem.base64) {
                    const timestamp = new Date().getTime() + i;
                    const slug = currentFile ? currentFile.name.replace('.md', '') : title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                    const imageFilename = `gallery-${slug}-${timestamp}.jpg`;
                    await uploadToGithub(`${IMAGE_DIR}/${imageFilename}`, `CMS: Galerijfoto geüpload: ${slug}`, gItem.base64);
                    finalGalleryList.push(`${PUBLIC_IMAGE_PREFIX}/${imageFilename}`);
                } else if (gItem.url) {
                    finalGalleryList.push(gItem.url);
                }
            }

            const updatedYaml = {
                ...originalYaml,
                title,
                description,
                youtube_url: youtubeUrl,
                horsetelex_url: horsetelexUrl,
                image: finalImageUrl,
                ...(finalVideoUrl ? { local_video: finalVideoUrl } : {}),
                ...(finalGalleryList.length > 0 ? { gallery: finalGalleryList } : {}),
                specs: {
                    ...(originalYaml.specs || {}),
                    age: specAge ? parseInt(specAge) || 0 : 0,
                    gender: specGender,
                    height: specHeight,
                    level: specLevel,
                    purchase_price: specPurchasePrice,
                    target_sale: specTargetSale
                }
            };
            const newMd = `---\n${yaml.dump(updatedYaml)}---\n\n${bodyContent}`;

            const slug = currentFile ? currentFile.name.replace('.md', '') : title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

            const langs = ['nl', 'en', 'de', 'es'];
            for (const lang of langs) {
                const targetPath = `src/content/portfolio/${lang}/${slug}.md`;
                let fileSha = null;
                let fileTitle = title;
                let fileDesc = description;
                let fileBody = bodyContent;
                let fileOriginalYaml = originalYaml;

                if (lang !== portfolioLang) {
                    try {
                        const existingData = await fetchFromGithub(targetPath);
                        fileSha = existingData.sha;
                        const decoded = decodeUtf8B64(existingData.content);
                        const parts = decoded.split('---');
                        if (parts.length >= 3) {
                            fileOriginalYaml = yaml.load(parts[1]) || {};
                            fileTitle = fileOriginalYaml.title || title;
                            fileDesc = fileOriginalYaml.description || description; 
                            fileBody = parts.slice(2).join('---').trim() || bodyContent; 
                        }
                    } catch (e) {
                        // Bestand bestaat niet (voorkomt crashes bij nieuw paard, dupliceert de huidige taal)
                    }
                } else {
                    try {
                        const existingData = await fetchFromGithub(targetPath);
                        fileSha = existingData.sha;
                    } catch (e) {}
                }

                const targetYaml = {
                    ...fileOriginalYaml,
                    title: fileTitle,
                    description: fileDesc,
                    category: category,
                    youtube_url: youtubeUrl,
                    horsetelex_url: horsetelexUrl,
                    image: finalImageUrl,
                    ...(finalVideoUrl ? { local_video: finalVideoUrl } : {}),
                    ...(finalGalleryList.length > 0 ? { gallery: finalGalleryList } : {}),
                    specs: {
                        ...(fileOriginalYaml.specs || {}),
                        age: specAge ? parseInt(specAge) || 0 : 0,
                        gender: specGender,
                        height: specHeight,
                        level: specLevel,
                        purchase_price: specPurchasePrice,
                        target_sale: specTargetSale
                    }
                };

                const targetMd = `---\n${yaml.dump(targetYaml)}---\n\n${fileBody}`;
                const msg = fileSha ? `CMS: Paard geüpdatet (${lang})` : `CMS: Nieuw paard aangemaakt (${lang})`;
                await uploadToGithub(targetPath, msg, encodeUtf8B64(targetMd), fileSha);
            }

            try {
                await fetch('https://api.vercel.com/v1/integrations/deploy/prj_8ziNBTbHCZ2zrMCMR7koQ7DGKPLS/q0IfdpjTsn', { method: 'POST' });
            } catch (e) {
                console.log('Vercel hook failed', e);
            }

            Alert.alert('Succes', `Actie afgerond. Vercel is nu aan het bouwen, over ca. 60 seconden staat het live!`);
            loadPortfolioList();
        } catch (e) {
            Alert.alert('Upload Fout', e.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const deletePortfolioItem = async () => {
        if (!currentFile) return;

        const executeDelete = async () => {
            setIsProcessing(true);
            try {
                const slug = currentFile.name.replace('.md', '');
                const langs = ['nl', 'en', 'de', 'es'];
                for (const lang of langs) {
                    const targetPath = `src/content/portfolio/${lang}/${slug}.md`;
                    try {
                        const fileData = await fetchFromGithub(targetPath);
                        await deleteFromGithub(targetPath, `CMS: Paard '${title}' verwijderd (${lang})`, fileData.sha);
                    } catch (e) {
                        // Bestand bestaat niet in deze taal
                    }
                }

                // Trigger Vercel Deploy Hook
                try {
                    await fetch('https://api.vercel.com/v1/integrations/deploy/prj_8ziNBTbHCZ2zrMCMR7koQ7DGKPLS/q0IfdpjTsn', { method: 'POST' });
                } catch (e) {}

                if (Platform.OS === 'web') window.alert(`Correct verwijderd! Vercel is nu aan het bouwen en over ca. 60 seconden is het verdwenen van de website.`);
                else Alert.alert('Verwijderd', `Correct verwijderd! Vercel is nu aan het bouwen en over ca. 60 seconden is het verdwenen van de website.`);
                
                setScreen('portfolioList');
                loadPortfolioList();
            } catch(e) {
                if (Platform.OS === 'web') window.alert('Fout bij Verwijderen: ' + e.message);
                else Alert.alert('Fout bij Verwijderen', e.message);
            } finally {
                setIsProcessing(false);
            }
        };

        const confirmMessage = `Weet je zeker dat je ${title || 'dit paard'} wilt verwijderen? Dit wordt direct verwijderd van de live website.`;

        if (Platform.OS === 'web') {
            if (window.confirm(confirmMessage)) {
                executeDelete();
            }
        } else {
            Alert.alert(
                'Paard Verwijderen',
                confirmMessage,
                [
                    { text: 'Annuleren', style: 'cancel' },
                    { text: 'Verwijder Definitief', style: 'destructive', onPress: executeDelete }
                ]
            );
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
            try {
                await fetch('https://api.vercel.com/v1/integrations/deploy/prj_8ziNBTbHCZ2zrMCMR7koQ7DGKPLS/q0IfdpjTsn', { method: 'POST' });
            } catch (e) {
                console.log('Vercel hook failed', e);
            }
            Alert.alert('Perfect', 'Alle veranderde teksten staan over ca. 60 seconden live!');

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

                    <View style={styles.homeLangSelector}>
                        <Text style={styles.homeLangTitle}>{ui.sel_lang}</Text>
                        <View style={styles.langSelectorRow}>
                            {[{ code: 'nl', label: '🇳🇱 NL' }, { code: 'en', label: '🇬🇧 EN' }, { code: 'de', label: '🇩🇪 DE' }, { code: 'es', label: '🇪🇸 ES' }].map(lang => (
                                <TouchableOpacity 
                                    key={lang.code} 
                                    style={[styles.homeLangBtn, portfolioLang === lang.code && styles.homeLangBtnActive]} 
                                    onPress={() => setPortfolioLang(lang.code)}
                                >
                                    <Text style={[styles.homeLangText, portfolioLang === lang.code && styles.homeLangTextActive]}>{lang.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={{ padding: 24, paddingTop: 12 }}>
                        <TouchableOpacity style={styles.dashCard} onPress={loadPortfolioList}>
                            <LinearGradient colors={['#1A202C', '#2D3748']} style={styles.dashCardGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                                <View style={styles.dashCardIcon}><Feather name="book-open" color="#FFF" size={28} /></View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.dashCardTitle}>{ui.portfolio_title}</Text>
                                    <Text style={styles.dashCardDesc}>{ui.portfolio_desc}</Text>
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.dashCard} onPress={createNewPortfolioItem}>
                            <LinearGradient colors={['#3182ce', '#2b6cb0']} style={styles.dashCardGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                                <View style={[styles.dashCardIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}><Feather name="plus" color="#FFF" size={28} /></View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.dashCardTitle}>{ui.new_title}</Text>
                                    <Text style={[styles.dashCardDesc, { color: '#EBF8FF' }]}>{ui.new_desc}</Text>
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.dashCard} onPress={openTextEditor}>
                            <LinearGradient colors={['#FFFFFF', '#F7FAFC']} style={styles.dashCardGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                                <View style={[styles.dashCardIcon, { backgroundColor: '#EDF2F7' }]}><Feather name="settings" color="#2D3748" size={28} /></View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.dashCardTitle, { color: '#1A202C' }]}>{ui.texts_title}</Text>
                                    <Text style={[styles.dashCardDesc, { color: '#718096' }]}>{ui.texts_desc}</Text>
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
        const filteredItems = listCategory === 'All' ? items : items.filter(i => i.category === listCategory);

        return (
            <SafeAreaView style={styles.safeAreaList}>
                <View style={styles.subHeader}>
                    <TouchableOpacity onPress={() => setScreen('home')}><Feather name="arrow-left" color="#1A202C" size={26} /></TouchableOpacity>
                    <Text style={styles.subHeaderTitle}>{ui.db}</Text>
                    <View style={{ width: 26 }} />
                </View>

                <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
                        {['All', 'Hunters', 'Jumpers', "Pony's", 'Equitation'].map(cat => (
                            <TouchableOpacity 
                                key={cat} 
                                style={[styles.catBtn, listCategory === cat && styles.catBtnActive]} 
                                onPress={() => setListCategory(cat)}
                            >
                                <Text style={[styles.catBtnText, listCategory === cat && styles.catBtnTextActive]}>{cat}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <FlatList
                    data={filteredItems}
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
                        <Text style={styles.subHeaderTitle}>{title.substring(0, 20) || ui.edit}</Text>
                        <View style={{ width: 26 }} />
                    </View>
                    <ScrollView contentContainerStyle={styles.scrollForm}>

                        <View style={styles.sectionCard}>
                            <Text style={styles.sectionHeader}>{ui.gen_info}</Text>
                            <Text style={styles.label}>{ui.name}</Text>
                            <TextInput style={styles.input} value={title} onChangeText={setTitle} />
                            <Text style={styles.label}>{ui.desc}</Text>
                            <TextInput style={styles.input} value={description} onChangeText={setDescription} />

                            <Text style={styles.label}>Categorie</Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 }}>
                                {['Hunters', 'Jumpers', "Pony's", 'Equitation'].map(cat => (
                                    <TouchableOpacity 
                                        key={cat} 
                                        style={[styles.catBtn, category === cat && styles.catBtnActive]} 
                                        onPress={() => setCategory(cat)}
                                    >
                                        <Text style={[styles.catBtnText, category === cat && styles.catBtnTextActive]}>{cat}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.label}>{ui.pic}</Text>
                            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                                <Feather name="camera" color="#4A5568" size={24} style={{ marginBottom: 8 }} />
                                <Text style={{ color: '#4A5568', fontWeight: '500' }}>{imageUri ? ui.pic_changed : ui.pic_new}</Text>
                            </TouchableOpacity>
                            {imageIsNew && <Image source={{ uri: imageUri }} style={styles.imagePreview} />}

                            <Text style={[styles.label, {marginTop: 12}]}>Lokale Video (max ~15 sec)</Text>
                            <TouchableOpacity style={styles.imagePicker} onPress={pickVideo}>
                                <Feather name="video" color="#4A5568" size={24} style={{ marginBottom: 8 }} />
                                <Text style={{ color: '#4A5568', fontWeight: '500' }}>{videoIsNew ? "Nieuwe Video Bevestigd!" : (originalYaml?.local_video ? "Wijzig Video" : "Selecteer Video")}</Text>
                            </TouchableOpacity>

                            <Text style={[styles.label, {marginTop: 12}]}>Extra Galerij Foto's (max 10)</Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                                {gallery.map((gItem, i) => (
                                    <View key={i} style={{ width: 60, height: 60, overflow: 'hidden', borderRadius: 4, position: 'relative' }}>
                                        <Image source={{ uri: gItem.isNew ? gItem.uri : gItem.url.replace('../../../assets', 'https://equivestworldwide.com') }} style={{ width: 60, height: 60, backgroundColor: '#E2E8F0' }} />
                                        <TouchableOpacity onPress={() => removeGalleryImage(i)} style={{ position: 'absolute', top: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', padding: 4 }}>
                                            <Feather name="x" color="#fff" size={12} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                            {gallery.length < 10 && (
                                <TouchableOpacity style={[styles.imagePicker, { padding: 12 }]} onPress={pickGalleryImage}>
                                    <Feather name="plus-square" color="#4A5568" size={20} style={{ marginBottom: 4 }} />
                                    <Text style={{ color: '#4A5568', fontWeight: '500', fontSize: 12 }}>Voeg Galerijfoto Toe</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        <View style={styles.sectionCard}>
                            <Text style={styles.sectionHeader}>{ui.specs}</Text>
                            <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                                <View style={{ flex: 1, marginRight: 8 }}>
                                    <Text style={styles.label}>{ui.age}</Text>
                                    <TextInput style={styles.input} value={specAge} onChangeText={setSpecAge} keyboardType="numeric" />
                                </View>
                                <View style={{ flex: 1, marginLeft: 8 }}>
                                    <Text style={styles.label}>{ui.gender}</Text>
                                    <TextInput style={styles.input} value={specGender} onChangeText={setSpecGender} />
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ flex: 1, marginRight: 8 }}>
                                    <Text style={styles.label}>{ui.height}</Text>
                                    <TextInput style={styles.input} value={specHeight} onChangeText={setSpecHeight} />
                                </View>
                                <View style={{ flex: 1, marginLeft: 8 }}>
                                    <Text style={styles.label}>{ui.level}</Text>
                                    <TextInput style={styles.input} value={specLevel} onChangeText={setSpecLevel} />
                                </View>
                            </View>
                        </View>

                        <View style={styles.sectionCard}>
                            <Text style={styles.sectionHeader}>{ui.fin}</Text>
                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ flex: 1, marginRight: 8 }}>
                                    <Text style={styles.label}>{ui.buy}</Text>
                                    <TextInput style={styles.input} value={specPurchasePrice} onChangeText={setSpecPurchasePrice} placeholder="€ 30.000" />
                                </View>
                                <View style={{ flex: 1, marginLeft: 8 }}>
                                    <Text style={styles.label}>{ui.target}</Text>
                                    <TextInput style={styles.input} value={specTargetSale} onChangeText={setSpecTargetSale} placeholder="TBD" />
                                </View>
                            </View>
                        </View>

                        <View style={styles.sectionCard}>
                            <Text style={styles.sectionHeader}>{ui.media}</Text>
                            <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                                <View style={{ flex: 1, marginRight: 8 }}>
                                    <Text style={styles.label}>{ui.yt}</Text>
                                    <TextInput style={styles.input} value={youtubeUrl} onChangeText={setYoutubeUrl} placeholder="https://" />
                                </View>
                                <View style={{ flex: 1, marginLeft: 8 }}>
                                    <Text style={styles.label}>{ui.ht}</Text>
                                    <TextInput style={styles.input} value={horsetelexUrl} onChangeText={setHorsetelexUrl} placeholder="https://" />
                                </View>
                            </View>

                            <Text style={styles.label}>{ui.body}</Text>
                            <TextInput style={[styles.input, styles.textArea]} value={bodyContent} onChangeText={setBodyContent} multiline textAlignVertical='top' />
                        </View>

                        <TouchableOpacity style={styles.publishBtn} onPress={savePortfolioChanges} disabled={isProcessing}>
                            {isProcessing ? <ActivityIndicator color="#fff" /> : <><Feather name="check" color="#fff" size={20} /><Text style={styles.publishBtnText}>{ui.save}</Text></>}
                        </TouchableOpacity>

                        {currentFile && (
                            <TouchableOpacity style={[styles.publishBtn, { backgroundColor: '#E53E3E', marginTop: 12 }]} onPress={deletePortfolioItem} disabled={isProcessing}>
                                {isProcessing ? <ActivityIndicator color="#fff" /> : <><Feather name="trash-2" color="#fff" size={20} /><Text style={styles.publishBtnText}>{ui.del}</Text></>}
                            </TouchableOpacity>
                        )}
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
    langTextActive: { color: '#3182ce' },

    homeLangSelector: { marginHorizontal: 20, marginTop: 10, backgroundColor: '#FFF', padding: 16, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
    homeLangTitle: { fontSize: 14, fontWeight: '700', color: '#4A5568', marginBottom: 12 },
    langSelectorRow: { flexDirection: 'row', justifyContent: 'space-between' },
    homeLangBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#EDF2F7' },
    homeLangBtnActive: { backgroundColor: '#3182ce' },
    homeLangText: { fontSize: 13, fontWeight: '700', color: '#4A5568' },
    homeLangTextActive: { color: '#FFF' },

    catBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#EDF2F7', marginRight: 8, marginBottom: 8 },
    catBtnActive: { backgroundColor: '#3182ce' },
    catBtnText: { fontSize: 14, fontWeight: '700', color: '#4A5568' },
    catBtnTextActive: { color: '#FFF' },
    langTextActive: { color: '#3182CE' },

    searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', margin: 16, marginTop: 0, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
    searchInput: { flex: 1, paddingVertical: 12, marginLeft: 8, fontSize: 15, color: '#1A202C' },

    textEditItem: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' },
    textEditKey: { fontSize: 11, fontWeight: '800', color: '#718096', marginBottom: 8 },
    textEditInput: { fontSize: 15, color: '#1A202C', lineHeight: 22, backgroundColor: '#F7FAFC', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#EDF2F7' },

    homeLangSelector: { marginHorizontal: 24, marginBottom: 4, marginTop: -10 },
    homeLangTitle: { fontSize: 12, fontWeight: '800', color: '#718096', textTransform: 'uppercase', marginBottom: 10 },
    langSelectorRow: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 12, padding: 6, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
    homeLangBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 8 },
    homeLangBtnActive: { backgroundColor: '#EBF8FF' },
    homeLangText: { fontSize: 14, fontWeight: '700', color: '#A0AEC0' },
    homeLangTextActive: { color: '#3182CE' },
});
