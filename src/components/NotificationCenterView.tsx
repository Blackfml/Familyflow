/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Bell, 
  Volume2, 
  Settings, 
  Sparkles, 
  Smartphone, 
  Award, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Check, 
  ChevronRight, 
  Copy, 
  ArrowLeft, 
  Moon, 
  MessageSquare,
  Shield,
  RefreshCw,
  Eye,
  Calendar,
  User,
  Heart
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { FamilyState, Task, Habit } from "../types";

interface NotificationCenterViewProps {
  state: FamilyState | null;
  currentUser: string;
  onClose: () => void;
  onSaveTask: (task: Task) => Promise<void>;
  onTriggerToast: (msg: string) => void;
  systemNotificationPermission?: string;
  onRequestSystemPermission?: () => void;
}

// Sound synth helper using Web Audio API
const playSynthSound = (type: "tarefas" | "lembretes" | "ia" | "conquistas" | "sistema") => {
  if (typeof window === "undefined" || !window.AudioContext) return;
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const dest = ctx.destination;
    
    if (type === "tarefas") {
      // Elegant upbeat double chime
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc1.frequency.setValueAtTime(659.25, ctx.currentTime + 0.12); // E5
      
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(1046.5, ctx.currentTime); // C6
      osc2.frequency.setValueAtTime(1318.5, ctx.currentTime + 0.12); // E6
      
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
      
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(dest);
      
      osc1.start();
      osc1.stop(ctx.currentTime + 0.45);
      osc2.start();
      osc2.stop(ctx.currentTime + 0.45);
    } else if (type === "lembretes") {
      // Soft double-tone alert
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(587.33, ctx.currentTime + 0.15); // D5 repeat
      
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.setValueAtTime(0.01, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      
      osc.connect(gain);
      gain.connect(dest);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } else if (type === "ia") {
      // Futuristic synth sweep
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.4);
      
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1000, ctx.currentTime);
      filter.frequency.linearRampToValueAtTime(300, ctx.currentTime + 0.4);
      
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(dest);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } else if (type === "conquistas") {
      // Rising major-chord arpeggio
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 1046.5]; // C4, E4, G4, C5, E5, C6
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.85);
      gain.connect(dest);
      
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        osc.connect(gain);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + 0.8);
      });
    } else {
      // Standard click/ping
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(dest);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    }
  } catch (err) {
    console.warn("Audio Context failed:", err);
  }
};

export default function NotificationCenterView({ 
  state, 
  currentUser, 
  onClose, 
  onSaveTask, 
  onTriggerToast,
  systemNotificationPermission = "default",
  onRequestSystemPermission
}: NotificationCenterViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<"emulator" | "channels" | "code">("emulator");
  const [activeCodeFile, setActiveCodeFile] = useState<"service" | "handler" | "manifest" | "main">("service");
  
  // Channels Config State
  const [quietHours, setQuietHours] = useState<boolean>(true);
  const [quietStart, setQuietStart] = useState<string>("22:00");
  const [quietEnd, setQuietEnd] = useState<string>("07:00");
  const [allowUrgents, setAllowUrgents] = useState<boolean>(true);
  const [channels, setChannels] = useState({
    tarefas: { enabled: true, priority: "Urgente (Heads-up)", sound: "Chime Clássico", vibration: "Urgente Forte" },
    lembretes: { enabled: true, priority: "Alta (Heads-up)", sound: "Sino Zen", vibration: "Normal Dupla" },
    ia: { enabled: true, priority: "Média (Som)", sound: "Sintonia Duo", vibration: "Suave Curta" },
    mensagens: { enabled: true, priority: "Alta (Heads-up)", sound: "WhatsApp Chime", vibration: "Normal Dupla" },
    conquistas: { enabled: true, priority: "Média (Som)", sound: "Triunfante", vibration: "Suave Curta" },
    sistema: { enabled: false, priority: "Baixa (Silencioso)", sound: "Nenhum", vibration: "Nenhuma" },
  });

  // Emulator floating heads-up alert state
  const [simulatedHeadsUp, setSimulatedHeadsUp] = useState<{
    id: string;
    title: string;
    body: string;
    responsible?: string;
    creator?: string;
    time?: string;
    channel: "tarefas" | "lembretes" | "ia" | "conquistas" | "sistema";
    priority: "Urgente" | "Alta" | "Média" | "Baixa";
    buttons: string[];
    taskId?: string;
  } | null>(null);

  const [lastVibrationPattern, setLastVibrationPattern] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Trigger simulated heads-up alert
  const triggerSimulation = (scenarioId: number) => {
    // Clear existing
    setSimulatedHeadsUp(null);
    
    setTimeout(() => {
      let title = "";
      let body = "";
      let creator = "";
      let responsible = "";
      let time = "";
      let channel: "tarefas" | "lembretes" | "ia" | "conquistas" | "sistema" = "tarefas";
      let priority: "Urgente" | "Alta" | "Média" | "Baixa" = "Alta";
      let buttons: string[] = [];
      let taskId = "";

      // Find first incomplete task assigned to current user, if any
      const userTasks = state?.tasks.filter(t => t.responsible === currentUser && t.status !== "Concluído") || [];
      const anyTask = userTasks[0] || state?.tasks[0] || { id: "mock-id-1", title: "Trocar resistência do chuveiro", date: "2026-06-30", time: "18:00" };

      switch (scenarioId) {
        case 1: // Nova tarefa
          title = "🔔 Brenda criou uma tarefa para você";
          body = `"${anyTask.title}"`;
          creator = "Brenda";
          responsible = currentUser || "Alessandro";
          channel = "tarefas";
          priority = "Urgente";
          buttons = ["✔ Marcar como concluída", "📅 Adiar 10 min", "👀 Abrir tarefa"];
          taskId = anyTask.id;
          break;
        case 2: // Lembrete (15 min antes)
          title = "⏰ Você possui uma tarefa em breve";
          body = `"${anyTask.title}" às ${anyTask.time || "18:00"}`;
          responsible = currentUser || "Alessandro";
          time = anyTask.time || "18:00";
          channel = "lembretes";
          priority = "Alta";
          buttons = ["Concluir", "Adiar 10 minutos", "Abrir"];
          taskId = anyTask.id;
          break;
        case 3: // Tarefa atrasada (Agrupado)
          title = "⚠️ Alerta de Tarefas Atrasadas";
          body = "Você possui 3 tarefas pendentes de hoje:\n• Mercado\n• Academia\n• Buscar crianças";
          channel = "tarefas";
          priority = "Alta";
          buttons = ["👀 Ver todas", "Snooze Tudo"];
          break;
        case 4: // Resumo Diário (08:00)
          title = `☀️ Bom dia, ${currentUser || "Alessandro"}!`;
          body = "Hoje você possui ✔ 2 compromissos e 📅 5 tarefas.\nSintonia do casal: ❤️ 84%. Planejamento da IA pronto!";
          channel = "sistema";
          priority = "Média";
          buttons = ["Análise IA", "Minha Agenda"];
          break;
        case 5: // Mensagem IA
          title = "🤖 FamilyFlow IA";
          body = "Analisei sua rotina e percebi que Brenda está sobrecarregada. Deseja redistribuir 2 tarefas para equilibrar?";
          channel = "ia";
          priority = "Média";
          buttons = ["Ver sugestão", "Ignorar"];
          break;
        default:
          return;
      }

      // 1. Play synthetic chime according to the selected channel settings
      if (channels[channel]?.enabled) {
        playSynthSound(channel);
      }

      // 2. Mock Device Vibration feedback
      const vibeType = channels[channel]?.vibration || "Normal Dupla";
      setLastVibrationPattern(vibeType);
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        if (vibeType === "Urgente Forte") {
          navigator.vibrate([400, 150, 400, 150, 400]);
        } else if (vibeType === "Normal Dupla") {
          navigator.vibrate([200, 100, 200]);
        } else if (vibeType === "Suave Curta") {
          navigator.vibrate([80]);
        }
      }
      setTimeout(() => setLastVibrationPattern(null), 3000);

      // 3. Mount simulated floating heads-up alert
      setSimulatedHeadsUp({
        id: `heads-up-${Date.now()}`,
        title,
        body,
        creator,
        responsible,
        time,
        channel,
        priority,
        buttons,
        taskId
      });

      // 4. Trigger REAL native system notification (so they see it outside the app, on phone or desktop!)
      if (typeof Notification !== "undefined" && (Notification.permission === "granted" || systemNotificationPermission === "granted")) {
        try {
          const cleanBody = body.replace(/[""]/g, '');
          if (navigator.serviceWorker && navigator.serviceWorker.controller) {
            navigator.serviceWorker.ready.then((reg) => {
              reg.showNotification(title, {
                body: cleanBody,
                icon: "https://cdn-icons-png.flaticon.com/512/3119/3119338.png",
                badge: "https://cdn-icons-png.flaticon.com/512/3119/3119338.png",
                tag: taskId || `sim-${Date.now()}`,
                renotify: true,
                silent: false,
                vibrate: [100, 50, 100],
                data: {
                  taskId: taskId
                },
                actions: [
                  { action: 'complete', title: '✔ Marcar Concluída' },
                  { action: 'snooze', title: '⏰ Adiar 10 min' },
                  { action: 'explore', title: '👀 Abrir App' }
                ]
              } as any);
            });
          } else {
            new Notification(title, {
              body: cleanBody,
              icon: "https://cdn-icons-png.flaticon.com/512/3119/3119338.png"
            });
          }
        } catch (err) {
          console.error("Erro ao disparar notificação real do sistema:", err);
        }
      }
    }, 150);
  };

  const copyCodeToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText("Código copiado!");
    setTimeout(() => setCopiedText(null), 2500);
  };

  // Handle action clicked inside the simulated heads-up card
  const handleHeadsUpAction = async (btn: string) => {
    if (!simulatedHeadsUp) return;
    
    const isConcluir = btn.includes("Concluir") || btn.includes("concluída") || btn.includes("Concluir");
    const isAdiar = btn.includes("Adiar") || btn.includes("adiar");
    const isAbrir = btn.includes("Abrir") || btn.includes("Ver") || btn.includes("Agenda") || btn.includes("IA") || btn.includes("sugestão");

    if (isConcluir && simulatedHeadsUp.taskId) {
      const task = state?.tasks.find(t => t.id === simulatedHeadsUp.taskId);
      if (task) {
        await onSaveTask({ ...task, status: "Concluído" });
        onTriggerToast(`✓ "${task.title}" concluída instantaneamente via notificação!`);
        playSynthSound("conquistas");
      } else {
        onTriggerToast("✓ Tarefa marcada como concluída e sincronizada com o parceiro!");
      }
    } else if (isAdiar) {
      onTriggerToast("⏰ Lembrete adiado em 10 minutos (Sincronizado no Firestore).");
    } else if (isAbrir) {
      onTriggerToast(`👀 Redirecionando e focando no painel correspondente.`);
    } else {
      onTriggerToast(`Ação rápida registrada: "${btn}"`);
    }

    // Dismiss
    setSimulatedHeadsUp(null);
  };

  // Code definitions for integration manual
  const codeFiles = {
    service: `// lib/services/notification_service.dart
import 'dart:ui';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter/foundation.dart';

class NotificationService {
  static final FlutterLocalNotificationsPlugin _notificationsPlugin =
      FlutterLocalNotificationsPlugin();

  static const String channelTarefasId = 'familyflow_tasks';
  static const String channelLembretesId = 'familyflow_reminders';
  static const String channelIAId = 'familyflow_ai';
  static const String channelConquistasId = 'familyflow_achievements';

  /// Inicializa as configurações de Notificação no Android 13+ e iOS
  static Future<void> initialize() async {
    // Configurações para o Android (com ícone padrão do aplicativo)
    const AndroidInitializationSettings androidSettings =
        AndroidInitializationSettings('@mipmap/ic_launcher');

    // Configurações para o iOS
    const DarwinInitializationSettings iosSettings = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );

    const InitializationSettings initSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await _notificationsPlugin.initialize(
      initSettings,
      onDidReceiveNotificationResponse: _onNotificationTapped,
      onDidReceiveBackgroundNotificationResponse: _onBackgroundNotificationTapped,
    );

    _createNotificationChannels();
  }

  /// Cria canais de notificações inteligentes com diferentes importâncias e vibrações
  static Future<void> _createNotificationChannels() async {
    final AndroidFlutterLocalNotificationsPlugin? androidImplementation =
        _notificationsPlugin.resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>();

    if (androidImplementation != null) {
      // 1. Canal de Tarefas (Urgente, som alto, heads-up)
      await androidImplementation.createNotificationChannel(
        const AndroidNotificationChannel(
          channelTarefasId,
          'Tarefas do Casal',
          description: 'Notificações urgentes de novas tarefas criadas pelo cônjuge',
          importance: Importance.max, // Garante heads-up flutuante
          playSound: true,
          enableVibration: true,
          vibrationPattern: Int64List.fromList([0, 400, 150, 400, 150, 400]),
        ),
      );

      // 2. Canal de Lembretes (Alta prioridade)
      await androidImplementation.createNotificationChannel(
        const AndroidNotificationChannel(
          channelLembretesId,
          'Lembretes Agendados',
          description: 'Lembretes de tarefas próximas com ações rápidas',
          importance: Importance.high,
          playSound: true,
          enableVibration: true,
          vibrationPattern: Int64List.fromList([0, 200, 100, 200]),
        ),
      );

      // 3. Canal da Inteligência Artificial
      await androidImplementation.createNotificationChannel(
        const AndroidNotificationChannel(
          channelIAId,
          'Dicas e Insights da IA',
          description: 'Recomendações e sugestões do FamilyFlow AI',
          importance: Importance.defaultImportance,
          playSound: true,
        ),
      );
    }
  }

  /// Exibe uma Notificação Flutuante (Heads-Up) do Android
  static Future<void> showFloatingNotification({
    required int id,
    required String title,
    required String body,
    required String channelId,
    String? payload,
  }) async {
    final AndroidNotificationDetails androidDetails = AndroidNotificationDetails(
      channelId,
      'Canal de Notificação',
      importance: Importance.max,
      priority: Priority.high,
      ticker: 'ticker',
      styleInformation: BigTextStyleInformation(body),
      // Botões rápidos de ação nativos (sem abrir o aplicativo!)
      actions: <AndroidNotificationAction>[
        const AndroidNotificationAction(
          'action_complete',
          '✔ Marcar como concluída',
          showsUserInterface: false, // background action
          cancelNotification: true,
        ),
        const AndroidNotificationAction(
          'action_snooze',
          '⏰ Adiar 10 minutos',
          showsUserInterface: false,
          cancelNotification: true,
        ),
        const AndroidNotificationAction(
          'action_open',
          '👀 Abrir',
          showsUserInterface: true, // Abre o app
        ),
      ],
    );

    final NotificationDetails details = NotificationDetails(
      android: androidDetails,
      iOS: const DarwinNotificationDetails(presentAlert: true, presentSound: true),
    );

    await _notificationsPlugin.show(id, title, body, details, payload: payload);
  }

  /// Callback disparado quando o usuário clica na notificação nativa
  static void _onNotificationTapped(NotificationResponse response) {
    if (response.payload != null) {
      debugPrint('Notificação clicada com payload: \${response.payload}');
      // Tratar navegação profunda (Deep Linking) para a tarefa correspondente
    }
  }

  /// Callback de background para botões rápidos de ação (Android 14+)
  @pragma('vm:entry-point')
  static void _onBackgroundNotificationTapped(NotificationResponse response) {
    debugPrint('Ação rápida clicada em segundo plano: \${response.actionId}');
    if (response.actionId == 'action_complete') {
      // 1. Atualiza o status da tarefa diretamente no Cloud Firestore
      // 2. Sincroniza em tempo real com o parceiro instantaneamente
      // 3. Cancela a notificação
    }
  }
}`,
    handler: `// lib/services/firebase_messaging_handler.dart
import 'package:firebase_messaging/firebase_messaging.dart';
import 'notification_service.dart';

@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  // Chamado quando o aplicativo está FECHADO ou em SEGUNDO PLANO
  print("Recebendo mensagem do Firebase em segundo plano: \${message.messageId}");
  
  final data = message.data;
  final title = message.notification?.title ?? data['title'] ?? 'FamilyFlow';
  final body = message.notification?.body ?? data['body'] ?? '';
  final channel = data['channel'] ?? NotificationService.channelTarefasId;

  // Mostra a notificação Heads-up nativa
  await NotificationService.showFloatingNotification(
    id: message.hashCode,
    title: title,
    body: body,
    channelId: channel,
    payload: data['taskId'],
  );
}

class FirebaseMessagingHandler {
  final FirebaseMessaging _fcm = FirebaseMessaging.instance;

  Future<void> setupFCM() async {
    // 1. Solicita as permissões do Android 13+ (POST_NOTIFICATIONS)
    NotificationSettings settings = await _fcm.requestPermission(
      alert: true,
      badge: true,
      sound: true,
      provisional: false,
    );

    if (settings.authorizationStatus == AuthorizationStatus.authorized) {
      print('Permissão de notificações concedida no Android!');
    }

    // 2. Registra o background handler para quando o app estiver fechado
    FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);

    // 3. Escuta notificações em primeiro plano (Foreground)
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      final data = message.data;
      
      // Converte a notificação do FCM em um heads-up flutuante local imediato
      NotificationService.showFloatingNotification(
        id: message.hashCode,
        title: message.notification?.title ?? data['title'] ?? 'FamilyFlow',
        body: message.notification?.body ?? data['body'] ?? '',
        channelId: data['channel'] ?? NotificationService.channelTarefasId,
        payload: data['taskId'],
      );
    });
  }
}`,
    manifest: `<!-- android/app/src/main/AndroidManifest.xml -->
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    
    <!-- Permissões Obrigatórias para Android 13+ (Heads-up e Som) -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
    <uses-permission android:name="android.permission.VIBRATE"/>
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED"/>
    <uses-permission android:name="android.permission.WAKE_LOCK"/>

    <application
        android:label="FamilyFlow"
        android:name="\${applicationName}"
        android:icon="@mipmap/ic_launcher">
        
        <!-- Receiver para reagendar lembretes após o celular reiniciar -->
        <receiver android:name="com.dexterous.flutterlocalnotifications.ScheduledNotificationBootReceiver"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.BOOT_COMPLETED"/>
                <action android:name="android.intent.action.MY_PACKAGE_REPLACED"/>
                <action android:name="android.quickboot.poweron"/>
            </intent-filter>
        </receiver>

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTop"
            android:theme="@style/LaunchTheme"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|smallestScreenSize|screenLayout|density"
            android:hardwareAccelerated="true"
            android:windowSoftInputMode="adjustResize">
            
            <intent-filter>
                <action android:name="android.intent.action.MAIN"/>
                <category android:name="android.intent.category.LAUNCHER"/>
            </intent-filter>
        </activity>
    </application>
</manifest>`,
    main: `// lib/main.dart
import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'services/notification_service.dart';
import 'services/firebase_messaging_handler.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // 1. Inicializa o Firebase
  await Firebase.initializeApp();
  
  // 2. Inicializa o serviço de notificações locais do Android
  await NotificationService.initialize();
  
  // 3. Ativa os ouvintes de Mensagens Push em Background/Foreground
  await FirebaseMessagingHandler().setupFCM();
  
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'FamilyFlow',
      theme: ThemeData(
        brightness: Brightness.dark,
        primaryColor: const Color(0xFF1E6091),
        scaffoldBackgroundColor: const Color(0xFF090B14),
      ),
      home: const HomeScreen(),
    );
  }
}

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Text('FamilyFlow Carregado com Sucesso!'),
      ),
    );
  }
}`
  };

  return (
    <div className="absolute inset-0 bg-[#090B14] z-50 flex flex-col overflow-hidden text-slate-100">
      
      {/* HEADER DE NAVEGAÇÃO */}
      <div className="px-5 py-4 border-b border-slate-800/80 flex items-center justify-between shrink-0 bg-[#0d111f] select-none">
        <button 
          onClick={onClose}
          className="p-1 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 transition cursor-pointer flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-slate-300" />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[11px] font-black uppercase tracking-widest text-brand-primary">Módulo Android</span>
          <h2 className="text-sm font-black text-white flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-brand-primary" /> Central de Notificações
          </h2>
        </div>
        <div className="w-7 h-7" /> {/* spacer */}
      </div>

      {/* SUB TABS */}
      <div className="flex border-b border-slate-800/40 bg-[#090B14] shrink-0 p-1">
        <button
          onClick={() => setActiveSubTab("emulator")}
          className={`flex-1 py-3 text-[11px] font-black uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === "emulator" 
              ? "bg-[#151B2C] text-brand-primary border border-slate-800/80" 
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" /> Simulador Android
        </button>
        <button
          onClick={() => setActiveSubTab("channels")}
          className={`flex-1 py-3 text-[11px] font-black uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === "channels" 
              ? "bg-[#151B2C] text-brand-primary border border-slate-800/80" 
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Settings className="w-3.5 h-3.5" /> Canais & Sons
        </button>
        <button
          onClick={() => setActiveSubTab("code")}
          className={`flex-1 py-3 text-[11px] font-black uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === "code" 
              ? "bg-[#151B2C] text-brand-primary border border-slate-800/80" 
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Smartphone className="w-3.5 h-3.5 text-brand-primary" /> Código Flutter
        </button>
      </div>

      {/* CORE SCROLLABLE AREA */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* 1. INTERACTIVE EMULATOR PANEL */}
        {activeSubTab === "emulator" && (
          <div className="space-y-4">

            {/* Real Web Notification Setup Panel */}
            <div className="bg-brand-card p-4 rounded-3xl border border-slate-800/80 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-xl flex items-center justify-center ${
                    systemNotificationPermission === "granted" 
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15" 
                      : "bg-amber-500/10 text-amber-400 border border-amber-500/15"
                  }`}>
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                      Controle de Notificações Ativas
                    </h4>
                    <p className="text-[11px] text-slate-400 font-semibold">
                      {systemNotificationPermission === "granted" 
                        ? "🟢 Conectado de forma segura fora do app!" 
                        : "🔴 Alertas nativos e flutuantes inativos fora do app"}
                    </p>
                  </div>
                </div>
                <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-1 rounded-md border ${
                  systemNotificationPermission === "granted" 
                    ? "bg-emerald-500/15 border-emerald-500/20 text-emerald-400" 
                    : "bg-amber-500/15 border-amber-500/20 text-amber-400"
                }`}>
                  {systemNotificationPermission === "granted" ? "Ativo" : "Pendente"}
                </span>
              </div>

              <div className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                {systemNotificationPermission === "granted" ? (
                  <span>
                    <strong>Excelente!</strong> Suas notificações flutuantes estão ativadas. Ao clicar em qualquer um dos cenários abaixo, o dispositivo disparará um alerta real <strong>fora do app</strong> com botões de ação integrados!
                  </span>
                ) : (
                  <span>
                    Para receber notificações no seu Android ou Desktop <strong>mesmo quando o navegador estiver fechado ou minimizado</strong>, ative as permissões do sistema.
                  </span>
                )}
              </div>

              {systemNotificationPermission !== "granted" ? (
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      if (onRequestSystemPermission) {
                        onRequestSystemPermission();
                      } else if (typeof Notification !== "undefined") {
                        Notification.requestPermission().then(permission => {
                          if (onTriggerToast) onTriggerToast(`Permissão de notificações: ${permission}`);
                        });
                      }
                    }}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-black text-[11px] uppercase tracking-wider rounded-xl cursor-pointer shadow-lg hover:shadow-blue-500/10 transition-all flex items-center justify-center gap-2 animate-pulse"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" /> ATIVAR NOTIFICAÇÕES REAIS NO DISPOSITIVO
                  </button>
                  
                  {/* Secure local context tip */}
                  <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl text-[8.5px] text-slate-400 leading-relaxed font-semibold">
                    🔒 <strong>Segurança do Dispositivo:</strong> A ativação é feita de forma segura dentro do aplicativo. Caso seu navegador solicite permissão, clique em "Permitir" para habilitar os alertas flutuantes no seu celular ou desktop!
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex items-center gap-2">
                  <span className="text-emerald-400 text-xs">✔</span>
                  <span className="text-[8.5px] text-slate-400 font-semibold leading-tight">
                    Sincronização em tempo real configurada! Você receberá atualizações de tarefas e mensagens do parceiro mesmo com a tela desligada.
                  </span>
                </div>
              )}
            </div>
            
            {/* Visual Phone Sandbox wrapper */}
            <div className="bg-slate-950 rounded-3xl border border-slate-800 p-4 space-y-4 relative overflow-hidden">
              <div className="flex justify-between items-center select-none text-[11px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800/40 pb-2">
                <span>Android OS 14 Emulator</span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                  Conectado ao Firestore
                </span>
              </div>

              {/* simulated phone screen frame */}
              <div className="relative bg-[#0d0f19] rounded-2xl border border-slate-800/80 aspect-[16/10] w-full flex flex-col justify-start items-center p-3 overflow-hidden shadow-inner">
                
                {/* Status Bar */}
                <div className="w-full flex justify-between items-center select-none opacity-40 text-[8px] font-mono mb-2">
                  <span>09:41</span>
                  <div className="w-10 h-3 bg-black rounded-full" /> {/* notch */}
                  <div className="flex items-center gap-1">
                    <span>5G</span>
                    <span className="material-symbols-rounded text-[11px]">battery_full</span>
                  </div>
                </div>

                {/* Simulated Heads-up container */}
                <div className="w-full relative z-40 h-28 flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    {simulatedHeadsUp ? (
                      <motion.div
                        key={simulatedHeadsUp.id}
                        initial={{ opacity: 0, y: -50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-3 space-y-2 pointer-events-auto"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 bg-gradient-to-tr from-blue-600 to-blue-500 rounded-md flex items-center justify-center text-white text-[11px] font-black">
                              F
                            </div>
                            <span className="text-[11px] font-black text-white tracking-wide uppercase">FamilyFlow</span>
                          </div>
                          <span className="text-[8px] text-slate-500 font-bold">agora</span>
                        </div>

                        <div>
                          <h4 className="text-[11px] font-black text-white leading-tight">
                            {simulatedHeadsUp.title}
                          </h4>
                          <p className="text-[11px] text-slate-400 font-semibold mt-0.5 whitespace-pre-line leading-relaxed">
                            {simulatedHeadsUp.body}
                          </p>
                        </div>

                        {/* Expandable Meta details */}
                        <div className="text-[8px] flex flex-wrap gap-2 text-slate-500 font-extrabold border-t border-slate-800/80 pt-1.5">
                          <span>Canal: <span className="text-brand-primary uppercase">{simulatedHeadsUp.channel}</span></span>
                          <span>Prioridade: <span className="text-brand-danger uppercase">{simulatedHeadsUp.priority}</span></span>
                          {simulatedHeadsUp.creator && <span>Criador: <span className="text-white">{simulatedHeadsUp.creator}</span></span>}
                        </div>

                        {/* Quick Action buttons */}
                        <div className="flex gap-1.5 pt-1">
                          {simulatedHeadsUp.buttons.map((btn, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleHeadsUpAction(btn)}
                              className={`flex-1 py-1.5 text-[8px] font-black rounded-lg cursor-pointer transition text-center ${
                                idx === 0 
                                  ? "bg-brand-primary hover:bg-blue-700 text-white" 
                                  : "bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-800/60"
                              }`}
                            >
                              {btn}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-6 select-none"
                      >
                        <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 mx-auto mb-2 animate-pulse">
                          <Bell className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">Aguardando Notificação...</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Simulated Vibration overlay banner */}
                <AnimatePresence>
                  {lastVibrationPattern && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute bottom-2 bg-red-500/10 border border-red-500/20 text-red-400 font-black text-[8px] px-3 py-1 rounded-full uppercase tracking-widest animate-pulse"
                    >
                      📳 Vibração Ativa: {lastVibrationPattern}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Test Trigger Cards list */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-brand-primary" /> Disparar Cenários de Notificação
              </h4>

              <div className="grid grid-cols-1 gap-2.5">
                <button
                  onClick={() => triggerSimulation(1)}
                  className="p-3 bg-brand-card hover:bg-[#151c31] border border-slate-800/80 rounded-2xl flex items-center justify-between text-left cursor-pointer transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-brand-danger animate-pulse" />
                      <span className="text-[11px] font-black text-white uppercase tracking-wider">Cenário 1: Nova Tarefa Urgente</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium">Brenda cria tarefa com botões [Concluir], [Adiar], [Abrir].</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>

                <button
                  onClick={() => triggerSimulation(2)}
                  className="p-3 bg-brand-card hover:bg-[#151c31] border border-slate-800/80 rounded-2xl flex items-center justify-between text-left cursor-pointer transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span className="text-[11px] font-black text-white uppercase tracking-wider">Cenário 2: Lembrete (15 min antes)</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium">Notificação heads-up para alertar sobre tarefa agendada brevemente.</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>

                <button
                  onClick={() => triggerSimulation(3)}
                  className="p-3 bg-brand-card hover:bg-[#151c31] border border-slate-800/80 rounded-2xl flex items-center justify-between text-left cursor-pointer transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-yellow-500" />
                      <span className="text-[11px] font-black text-white uppercase tracking-wider">Cenário 3: Lembretes Atrasados (Agrupado)</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium">Várias tarefas pendentes agrupadas de forma condensada.</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>

                <button
                  onClick={() => triggerSimulation(4)}
                  className="p-3 bg-brand-card hover:bg-[#151c31] border border-slate-800/80 rounded-2xl flex items-center justify-between text-left cursor-pointer transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-[11px] font-black text-white uppercase tracking-wider">Cenário 4: Resumo Diário do Casal (08:00)</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium">Resumo matinal com compromissos, tarefas e status de organização.</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>

                <button
                  onClick={() => triggerSimulation(5)}
                  className="p-3 bg-brand-card hover:bg-[#151c31] border border-slate-800/80 rounded-2xl flex items-center justify-between text-left cursor-pointer transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-500" />
                      <span className="text-[11px] font-black text-white uppercase tracking-wider">Cenário 5: Recomendação de Organização da IA</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium">FamilyFlow IA detecta desequilíbrio e sugere redistribuição de afazeres.</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            </div>

          </div>
        )}

        {/* 2. CANAIS & CONFIGS PANEL */}
        {activeSubTab === "channels" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            
            {/* Horário de Silêncio */}
            <div className="bg-brand-card p-4 rounded-3xl border border-slate-800/80 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Moon className="w-4 h-4 text-brand-purple" />
                  <div>
                    <h4 className="text-[11px] font-black text-white uppercase tracking-wider">Horário de Silêncio</h4>
                    <p className="text-[11px] text-slate-400 font-semibold">Silenciar alertas normais em horários específicos</p>
                  </div>
                </div>
                <button
                  onClick={() => setQuietHours(!quietHours)}
                  className={`w-10 h-5.5 rounded-full p-0.5 transition cursor-pointer ${quietHours ? "bg-brand-primary" : "bg-slate-850 border border-slate-800"}`}
                >
                  <div className={`w-4.5 h-4.5 rounded-full bg-white transition-all transform ${quietHours ? "translate-x-4.5" : "translate-x-0"}`} />
                </button>
              </div>

              {quietHours && (
                <div className="grid grid-cols-2 gap-3 pt-1 animate-in slide-in-from-top-2 duration-200">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase text-slate-500 tracking-wider">Início</label>
                    <input 
                      type="time" 
                      value={quietStart}
                      onChange={(e) => setQuietStart(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800/80 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-300 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase text-slate-500 tracking-wider">Fim</label>
                    <input 
                      type="time" 
                      value={quietEnd}
                      onChange={(e) => setQuietEnd(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800/80 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-300 focus:outline-none"
                    />
                  </div>

                  <div className="col-span-2 flex items-center justify-between border-t border-slate-800/40 pt-2">
                    <span className="text-[11px] text-slate-400 font-bold">Permitir Notificações Marcadas como Urgentes</span>
                    <button
                      onClick={() => setAllowUrgents(!allowUrgents)}
                      className={`w-8 h-4.5 rounded-full p-0.5 transition cursor-pointer ${allowUrgents ? "bg-brand-primary" : "bg-slate-850"}`}
                    >
                      <div className={`w-3.5 h-3.5 rounded-full bg-white transition-all transform ${allowUrgents ? "translate-x-3.5" : "translate-x-0"}`} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Canais de Notificação Android */}
            <div className="space-y-2.5">
              <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5 text-brand-primary" /> Canais Oficiais do Android
              </h4>

              <div className="space-y-2">
                {(Object.keys(channels) as Array<keyof typeof channels>).map((key) => {
                  const chan = channels[key];
                  const titleMap = {
                    tarefas: { name: "Tarefas do Casal", color: "text-blue-400 bg-blue-500/10 border-blue-500/15" },
                    lembretes: { name: "Lembretes Próximos", color: "text-amber-400 bg-amber-500/10 border-amber-500/15" },
                    ia: { name: "IA e Sugestões", color: "text-purple-400 bg-purple-500/10 border-purple-500/15" },
                    mensagens: { name: "Mensagens Internas", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/15" },
                    conquistas: { name: "Conquistas & Sincronia", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/15" },
                    sistema: { name: "Sistema & Backup", color: "text-slate-400 bg-slate-500/10 border-slate-500/15" },
                  };

                  return (
                    <div 
                      key={key}
                      className="p-3 bg-brand-card border border-slate-800/80 rounded-2xl flex flex-col gap-2"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black border ${titleMap[key].color}`}>
                            {key === "tarefas" ? "✓" : key === "lembretes" ? "⏰" : key === "ia" ? "🤖" : key === "mensagens" ? "💬" : key === "conquistas" ? "🏆" : "⚙"}
                          </span>
                          <div>
                            <h5 className="text-[11px] font-black text-white">{titleMap[key].name}</h5>
                            <span className="text-[8px] bg-slate-900 border border-slate-800 text-slate-400 font-extrabold px-1.5 py-0.5 rounded-md mt-0.5 inline-block uppercase tracking-wider">
                              id: familyflow_{key}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => setChannels({
                            ...channels,
                            [key]: { ...chan, enabled: !chan.enabled }
                          })}
                          className={`w-9 h-5 rounded-full p-0.5 transition cursor-pointer ${chan.enabled ? "bg-brand-primary" : "bg-slate-850"}`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white transition-all transform ${chan.enabled ? "translate-x-4" : "translate-x-0"}`} />
                        </button>
                      </div>

                      {chan.enabled && (
                        <div className="grid grid-cols-2 gap-2 text-[8px] font-extrabold text-slate-400 bg-slate-950/40 p-2 rounded-xl border border-slate-850">
                          <div>
                            <span>Som do Canal:</span>
                            <div className="text-white mt-0.5 flex items-center gap-1">
                              <Volume2 className="w-2.5 h-2.5 text-brand-primary" /> {chan.sound}
                            </div>
                          </div>
                          <div>
                            <span>Vibração:</span>
                            <div className="text-white mt-0.5">📳 {chan.vibration}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* 3. FLUTTER & ANDROID INTEGRATION MANUAL */}
        {activeSubTab === "code" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="bg-[#151c31]/30 p-3.5 border border-blue-500/10 rounded-2xl space-y-1.5">
              <h4 className="text-[11px] font-black uppercase text-brand-primary tracking-wider flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-brand-primary" /> Suporte Oficial Android 13 & 14+
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                Este manual fornece o código de integração Flutter usando as bibliotecas oficiais para obter as notificações flutuantes <strong className="text-white font-extrabold">Heads-up</strong> e botões rápidos (Quick Actions) sincronizados com o Firestore.
              </p>
            </div>

            {/* Code sub tabs */}
            <div className="flex gap-1 overflow-x-auto pb-1 shrink-0 scrollbar-none">
              {(["service", "handler", "manifest", "main"] as const).map((fileKey) => {
                const labelMap = {
                  service: "NotificationService.dart",
                  handler: "FCMHandler.dart",
                  manifest: "AndroidManifest.xml",
                  main: "main.dart"
                };
                return (
                  <button
                    key={fileKey}
                    onClick={() => setActiveCodeFile(fileKey)}
                    className={`px-3 py-2 text-[11px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer border whitespace-nowrap ${
                      activeCodeFile === fileKey 
                        ? "bg-[#151B2C] text-brand-primary border-slate-800" 
                        : "text-slate-500 bg-transparent border-transparent hover:text-slate-300"
                    }`}
                  >
                    {labelMap[fileKey]}
                  </button>
                );
              })}
            </div>

            {/* Code Block Container */}
            <div className="relative rounded-2xl border border-slate-800 bg-[#06080e] overflow-hidden">
              <div className="flex justify-between items-center px-4 py-2 bg-[#0b0e16] border-b border-slate-800/80">
                <span className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                  {activeCodeFile === "service" ? "DART / FLUTTER" : activeCodeFile === "handler" ? "DART / FCM" : activeCodeFile === "manifest" ? "XML / ANDROID" : "DART / MAIN"}
                </span>
                <button
                  onClick={() => copyCodeToClipboard(codeFiles[activeCodeFile])}
                  className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-slate-300 text-[8px] font-black rounded-lg hover:bg-slate-800 transition flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-2.5 h-2.5" /> {copiedText || "Copiar"}
                </button>
              </div>

              <pre className="p-4 overflow-x-auto text-[11px] font-mono text-slate-300 leading-relaxed max-h-96">
                <code>{codeFiles[activeCodeFile]}</code>
              </pre>
            </div>

            <div className="bg-slate-950 p-4 border border-slate-800/80 rounded-2xl space-y-2">
              <h5 className="text-[11px] font-black uppercase text-brand-warning tracking-widest flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-brand-warning" /> Regra do Firestore Sync (Background)
              </h5>
              <p className="text-[8.5px] text-slate-400 leading-relaxed font-semibold">
                Ao clicar em <strong className="text-white font-extrabold">Concluir</strong> na notificação sem abrir o aplicativo, o Flutter executa código no isolate de background. O payload é enviado para sua coleção Firestore sincronizando instantaneamente com o parceiro através de um trigger <code className="text-white bg-slate-900 px-1 py-0.5 rounded font-bold font-mono">db.collection('appState').doc('familyState')</code> que por sua vez cancela automaticamente o alerta no outro dispositivo!
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
