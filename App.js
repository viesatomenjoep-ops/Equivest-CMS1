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
  Animated,
  Easing,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { encode as btoa, decode as atob } from 'base-64';
import { LinearGradient } from 'expo-linear-gradient';
import yaml from 'js-yaml'; // eslint-disable-line
import { Feather } from '@expo/vector-icons';

const GITHUB_TOKEN = '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';
const GITHUB_OWNER = 'viesatomenjoep-ops';
const GITHUB_REPO = 'equivest-platform';
const GITHUB_BRANCH = 'main';

const CONTENT_DIR_BASE = 'src/content/portfolio';
const IMAGE_DIR = 'src/assets/images';
const PUBLIC_IMAGE_PREFIX = '../../../assets/images';

// ==========================================
// CMS APP TRANSLATIONS (Interface Localization)
// ==========================================
const cmsUI = {
  nl: {
    dashSub: 'Platform Beheer', dbLang: 'Database Taal:', portfTitle: 'Paarden Portfolio', portfDesc: 'Wijzig specificaties, foto\'s en details van de collectie.',
    webTitle: 'Website Teksten', webDesc: 'Bewerk de Homepage, Over Ons, en Team info.', portfDb: 'Portfolio', edit: 'Bewerken',
    genInfo: 'Algemene Informatie', name: 'Naam', desc: 'Omschrijving', profPic: 'Profiel Foto', newPic: 'Kies Nieuwe Foto', picChanged: 'Foto Gewijzigd!',
    specs: 'Specificaties', age: 'Leeftijd', gender: 'Geslacht', height: 'Stokmaat', level: 'Niveau', fin: 'Financieel & Investering',
    acq: 'Aankoopprijs (Acquisition)', target: 'Doelverkoop (Target)', media: 'Media & Web Links', yt: 'YouTube URL', bodyText: 'Artikel Tekst (App/Website Body)',
    saveVercel: 'Opslaan & Naar Vercel', transFile: 'Vertaal Bestand', save: 'Opslaan', search: 'Zoek tekst of sleutel...', noTrans: 'Geen vertalingen gevonden',
    newAd: 'Nieuwe Paardenadvertentie Toevoegen', createNew: 'Maak Nieuw', startNewAd: 'Nieuwe advertentie met huidige structuur'
  },
  en: {
    dashSub: 'Platform Management', dbLang: 'Database Language:', portfTitle: 'Horses Portfolio', portfDesc: 'Edit specifications, photos, and collection details.',
    webTitle: 'Website Texts', webDesc: 'Edit Homepage, About Us, and Team information.', portfDb: 'Portfolio', edit: 'Edit',
    genInfo: 'General Information', name: 'Name', desc: 'Description', profPic: 'Profile Photo', newPic: 'Choose New Photo', picChanged: 'Photo Changed!',
    specs: 'Specifications', age: 'Age', gender: 'Gender', height: 'Height', level: 'Level', fin: 'Financial & Investment',
    acq: 'Acquisition Price', target: 'Target Sale', media: 'Media & Web Links', yt: 'YouTube URL', bodyText: 'Article Text (App/Website Body)',
    saveVercel: 'Save & To Vercel', transFile: 'Translation File', save: 'Save', search: 'Search text or key...', noTrans: 'No translations found',
    newAd: 'Add new Horse Advertisement', createNew: 'Create New', startNewAd: 'New advertisement with current structure'
  },
  de: {
    dashSub: 'Plattformverwaltung', dbLang: 'Datenbanksprache:', portfTitle: 'Pferde Portfolio', portfDesc: 'Spezifikationen, Fotos und Details bearbeiten.',
    webTitle: 'Website Texte', webDesc: 'Startseite, Über Uns und Team bearbeiten.', portfDb: 'Portfolio', edit: 'Bearbeiten',
    genInfo: 'Allgemeine Info', name: 'Name', desc: 'Beschreibung', profPic: 'Profilbild', newPic: 'Neues Foto wählen', picChanged: 'Foto geändert!',
    specs: 'Spezifikationen', age: 'Alter', gender: 'Geschlecht', height: 'Stockmaß', level: 'Niveau', fin: 'Finanzen & Investition',
    acq: 'Kaufpreis (Acquisition)', target: 'Zielverkauf (Target)', media: 'Medien & Web Links', yt: 'YouTube URL', bodyText: 'Artikeltext (App/Website Body)',
    saveVercel: 'Speichern & Zu Vercel', transFile: 'Übersetzungsdatei', save: 'Speichern', search: 'Text oder Schlüssel suchen...', noTrans: 'Keine Übersetzungen gefunden',
    newAd: 'Neue Pferdeanzeige Hinzufügen', createNew: 'Neu Erstellen', startNewAd: 'Neue Anzeige mit aktueller Struktur'
  },
  es: {
    dashSub: 'Gestión de Plataforma', dbLang: 'Idioma de Base de Datos:', portfTitle: 'Portafolio de Caballos', portfDesc: 'Editar especificaciones, fotos y detalles.',
    webTitle: 'Textos del Sitio Web', webDesc: 'Editar Inicio, Sobre Nosotros y Equipo.', portfDb: 'Portafolio', edit: 'Editar',
    genInfo: 'Información General', name: 'Nombre', desc: 'Descripción', profPic: 'Foto de Perfil', newPic: 'Elegir Nueva Foto', picChanged: '¡Foto Cambiada!',
    specs: 'Especificaciones', age: 'Edad', gender: 'Género', height: 'Altura', level: 'Nivel', fin: 'Financiero & Inversión',
    acq: 'Precio de Adquisición', target: 'Venta Objetivo', media: 'Medios y Enlaces Web', yt: 'URL de YouTube', bodyText: 'Texto del Artículo (App/Website Body)',
    saveVercel: 'Guardar y A Vercel', transFile: 'Archivo de Traducción', save: 'Guardar', search: 'Buscar texto o clave...', noTrans: 'No se encontraron traducciones',
    newAd: 'Añadir Nuevo Anuncio de Caballo', createNew: 'Crear Nuevo', startNewAd: 'Nuevo anuncio con estructura actual'
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
  const [globalLang, setGlobalLang] = useState('en'); // 'en' | 'nl' | 'de' | 'es'
  const [isProcessing, setIsProcessing] = useState(false);

  // Translate helper function internally
  const t = (key) => cmsUI[globalLang][key];

  // --- Animation State ---
  const spinValue = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 12000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

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
  const [textSearchLang, setTextSearchLang] = useState('en');
  const [searchQuery, setSearchQuery] = useState('');

  // ==========================================
  // VIEW: PORTFOLIO
  // ==========================================
  const loadPortfolioList = async () => {
    setIsProcessing(true);
    try {
      const data = await fetchFromGithub(`${CONTENT_DIR_BASE}/${globalLang}`);
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

  const createNewPortfolioItem = () => {
    setCurrentFile({ sha: null, path: null, name: 'new.md', isNew: true });
    setOriginalYaml({});
    setTitle('');
    setDescription('');
    setYoutubeUrl('');
    setHorsetelexUrl('');
    setBodyContent('');
    setSpecAge('');
    setSpecGender('');
    setSpecHeight('');
    setSpecLevel('');
    setSpecPurchasePrice('');
    setSpecTargetSale('');
    setImageUri(null); setImageBase64(null); setImageIsNew(false);
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

  const savePortfolioChanges = async () => {
    if (!title.trim()) return Alert.alert('Fout', 'Titel ontbreekt');
    setIsProcessing(true);
    try {
      let finalImageUrl = originalYaml.image || '';

      if (imageIsNew && imageBase64) {
        const timestamp = new Date().getTime();
        const slugPrefix = title ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : 'img';
        const imageFilename = `${slugPrefix}-${timestamp}.jpg`;
        await uploadToGithub(`${IMAGE_DIR}/${imageFilename}`, `CMS: Foto geüpload: ${slugPrefix}`, imageBase64);
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

      let targetPath = currentFile.path;
      if (currentFile.isNew) {
        // Genereer een veilige slug vanuit de titel
        const docSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        targetPath = `${CONTENT_DIR_BASE}/${globalLang}/${docSlug}.md`;
      }

      await uploadToGithub(targetPath, `CMS: Paard '${title}' geüpdatet`, encodeUtf8B64(newMd), currentFile.sha);

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
      setTextSearchLang(globalLang);
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
      [textSearchLang]: { ...prev[textSearchLang], [key]: val }
    }));
  };

  const saveTextChanges = async () => {
    setIsProcessing(true);
    try {
      const jsonString = JSON.stringify(uiData, null, 2);
      await uploadToGithub('src/i18n/ui.json', `CMS: Tekst Dictionary (${textSearchLang}) aangepast`, encodeUtf8B64(jsonString), uiFileSha);
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
            <Text style={styles.dashboardSubtitle}>{t('dashSub')}</Text>
          </View>

          <View style={styles.globalLangPicker}>
            <Text style={styles.globalLangLabel}>{t('dbLang')}</Text>
            <View style={styles.langSelectorRow}>
              {['en', 'nl', 'de', 'es'].map(lang => (
                <TouchableOpacity
                  key={lang}
                  style={[styles.globalLangBtn, globalLang === lang && styles.globalLangBtnActive]}
                  onPress={() => setGlobalLang(lang)}
                >
                  <Text style={[styles.globalLangText, globalLang === lang && styles.globalLangTextActive]}>{lang.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={{ padding: 24, paddingTop: 12 }}>
            <TouchableOpacity style={styles.dashCard} onPress={loadPortfolioList}>
              <LinearGradient colors={['#1A202C', '#2D3748']} style={styles.dashCardGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <View style={styles.dashCardIcon}><Feather name="book-open" color="#FFF" size={28} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.dashCardTitle}>{t('portfTitle')}</Text>
                  <Text style={styles.dashCardDesc}>{t('portfDesc')}</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.dashCard} onPress={createNewPortfolioItem}>
              <LinearGradient colors={['#3182ce', '#2b6cb0']} style={styles.dashCardGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <View style={[styles.dashCardIcon, { backgroundColor: 'rgba(255,255,255,0.15)' }]}><Feather name="plus-circle" color="#FFF" size={28} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.dashCardTitle}>{t('newAd')}</Text>
                  <Text style={[styles.dashCardDesc, { color: 'rgba(255,255,255,0.8)' }]}>{t('startNewAd')}</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.dashCard} onPress={openTextEditor}>
              <LinearGradient colors={['#FFFFFF', '#F7FAFC']} style={styles.dashCardGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <View style={[styles.dashCardIcon, { backgroundColor: '#EDF2F7' }]}><Feather name="settings" color="#2D3748" size={28} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.dashCardTitle, { color: '#1A202C' }]}>{t('webTitle')}</Text>
                  <Text style={[styles.dashCardDesc, { color: '#718096' }]}>{t('webDesc')}</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.logoContainer}>
            <Animated.Image
              style={[styles.spinningLogo, { transform: [{ rotate: spin }] }]}
              source={{ uri: 'https://raw.githubusercontent.com/viesatomenjoep-ops/equivest-platform/main/public/images/logo.webp' }}
              resizeMode="contain"
            />
          </View>

          {isProcessing && <ActivityIndicator color="#1A202C" size="large" style={{marginTop: 40}} />}
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
          <Text style={styles.subHeaderTitle}>{t('portfDb')} ({globalLang.toUpperCase()})</Text>
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
          ListHeaderComponent={() => (
            <TouchableOpacity
              style={{
                flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                backgroundColor: '#EBF8FF', paddingVertical: 10, paddingHorizontal: 16,
                borderRadius: 12, borderWidth: 1, borderColor: '#BEE3F8',
                marginBottom: 16, marginHorizontal: 20, marginTop: 4
              }}
              onPress={createNewPortfolioItem}
            >
              <Feather name="plus-circle" color="#3182CE" size={18} />
              <Text style={{ color: '#2B6CB0', fontSize: 14, fontWeight: '700', marginLeft: 8 }}>{t('newAd')}</Text>
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
            <Text style={styles.subHeaderTitle}>{title.substring(0, 20) || t('edit')}</Text>
            <View style={{ width: 26 }} />
          </View>
          <ScrollView contentContainerStyle={styles.scrollForm}>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionHeader}>{t('genInfo')}</Text>

              <Text style={styles.label}>{t('name')}</Text>
              <TextInput style={styles.input} value={title} onChangeText={setTitle} />
              <Text style={styles.label}>{t('desc')}</Text>
              <TextInput style={styles.input} value={description} onChangeText={setDescription} />

              <Text style={styles.label}>{t('profPic')}</Text>
              <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                <Feather name="camera" color="#4A5568" size={24} style={{ marginBottom: 8 }} />
                <Text style={{ color: '#4A5568', fontWeight: '500' }}>{imageUri ? t('picChanged') : t('newPic')}</Text>
              </TouchableOpacity>
              {imageIsNew && <Image source={{ uri: imageUri }} style={styles.imagePreview} />}
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionHeader}>{t('specs')}</Text>
              <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.label}>{t('age')}</Text>
                  <TextInput style={styles.input} value={specAge} onChangeText={setSpecAge} keyboardType="numeric" />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.label}>{t('gender')}</Text>
                  <TextInput style={styles.input} value={specGender} onChangeText={setSpecGender} />
                </View>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.label}>{t('height')}</Text>
                  <TextInput style={styles.input} value={specHeight} onChangeText={setSpecHeight} />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.label}>{t('level')}</Text>
                  <TextInput style={styles.input} value={specLevel} onChangeText={setSpecLevel} />
                </View>
              </View>
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionHeader}>{t('fin')}</Text>
              <View style={{ flexDirection: 'row' }}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.label}>{t('acq')}</Text>
                  <TextInput style={styles.input} value={specPurchasePrice} onChangeText={setSpecPurchasePrice} placeholder="€ 30.000" />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.label}>{t('target')}</Text>
                  <TextInput style={styles.input} value={specTargetSale} onChangeText={setSpecTargetSale} placeholder="TBD" />
                </View>
              </View>
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionHeader}>{t('media')}</Text>
              <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.label}>{t('yt')}</Text>
                  <TextInput style={styles.input} value={youtubeUrl} onChangeText={setYoutubeUrl} placeholder="https://" />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.label}>HorseTelex</Text>
                  <TextInput style={styles.input} value={horsetelexUrl} onChangeText={setHorsetelexUrl} placeholder="https://" />
                </View>
              </View>

              <Text style={styles.label}>{t('bodyText')}</Text>
              <TextInput style={[styles.input, styles.textArea]} value={bodyContent} onChangeText={setBodyContent} multiline textAlignVertical='top' />
            </View>

            <TouchableOpacity style={styles.publishBtn} onPress={savePortfolioChanges} disabled={isProcessing}>
              {isProcessing ? <ActivityIndicator color="#fff" /> : <><Feather name="check" color="#fff" size={20} /><Text style={styles.publishBtnText}>{t('saveVercel')}</Text></>}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // --- WEBSITE TEXTS ---
  if (screen === 'textEdit' && uiData) {
    const textPairs = Object.entries(uiData[textSearchLang] || {}).filter(([k, v]) => {
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
            <Text style={styles.subHeaderTitle}>{t('transFile')}</Text>
            <TouchableOpacity onPress={saveTextChanges} disabled={isProcessing}>
              {isProcessing ? <ActivityIndicator size="small" /> : <Text style={{ color: '#3182ce', fontWeight: '700' }}>{t('save')}</Text>}
            </TouchableOpacity>
          </View>

          <View style={styles.langSelector}>
            {['en', 'nl', 'de', 'es'].map(lang => (
              <TouchableOpacity key={lang} style={[styles.langBtn, textSearchLang === lang && styles.langBtnActive]} onPress={() => setTextSearchLang(lang)}>
                <Text style={[styles.langText, textSearchLang === lang && styles.langTextActive]}>{lang.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.searchBox}>
            <Feather name="search" color="#A0AEC0" size={20} />
            <TextInput style={styles.searchInput} value={searchQuery} onChangeText={setSearchQuery} placeholder={t('search')} />
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
            ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40, color: '#a0aec0' }}>{t('noTrans')}</Text>}
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

  globalLangPicker: { marginHorizontal: 24, marginBottom: 12, backgroundColor: '#FFF', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  globalLangLabel: { fontSize: 13, fontWeight: '700', color: '#718096', textTransform: 'uppercase', marginBottom: 12 },
  langSelectorRow: { flexDirection: 'row', gap: 8 },
  globalLangBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: '#F7FAFC', alignItems: 'center', borderWidth: 1, borderColor: '#EDF2F7' },
  globalLangBtnActive: { backgroundColor: '#1A202C', borderColor: '#1A202C' },
  globalLangText: { fontSize: 15, fontWeight: '800', color: '#4A5568' },
  globalLangTextActive: { color: '#FFF' },

  logoContainer: { alignItems: 'center', marginTop: 30, flex: 1, justifyContent: 'flex-start' },
  spinningLogo: { width: 100, height: 100, opacity: 0.15 },

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
  sectionCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset:{width:0, height:4}, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
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
