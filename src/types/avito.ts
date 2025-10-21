export interface AvitoAccount {
  id: number;
  name: string;
  clientId: string;
  clientSecret?: string;
  userId?: string;
  proxyType?: string;
  proxyHost?: string;
  proxyPort?: number;
  proxyLogin?: string;
  proxyPassword?: string;
  connectionStatus?: string;
  proxyStatus?: string;
  accountBalance?: number;
  adsCount?: number;
  viewsCount?: number;
  contactsCount?: number;
  viewsToday?: number;
  contactsToday?: number;
  lastSyncAt?: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    orders: number;
    calls: number;
  };
}

export interface AvitoFormData {
  name: string;
  clientId: string;
  clientSecret: string;
  userId?: string;
  proxyType?: 'http' | 'socks4' | 'socks5';
  proxyHost?: string;
  proxyPort?: string;
  proxyLogin?: string;
  proxyPassword?: string;
}

export interface AvitoStats {
  totalAccounts: number;
  connectedAccounts: number;
  totalBalance: number;
  totalAds: number;
  totalViews: number;
  totalContacts: number;
  viewsToday: number;
  contactsToday: number;
}

export interface ProxyCheckResult {
  [accountId: number]: string;
}

export interface OnlineStatuses {
  [accountId: number]: boolean;
}

export interface EternalOnlineSettings {
  [accountId: number]: boolean;
}

export interface ShowProxyPasswords {
  [accountId: number]: boolean;
}

export interface ShowAllReviews {
  [accountId: number]: boolean;
}

export interface RatingInfo {
  isEnabled: boolean;
  rating?: {
    score: number;
    reviewsCount: number;
    reviewsWithScoreCount: number;
  };
}

export interface AvitoRating {
  accountId: number;
  accountName: string;
  error?: string;
  ratingInfo?: RatingInfo;
}

export interface Review {
  id: string;
  score: number;
  text: string;
  stage: 'done' | 'fell_through' | 'not_agree' | 'not_communicate';
  usedInScore: boolean;
  createdAt: number;
  sender?: {
    name: string;
  };
  item?: {
    title: string;
  };
  answer?: {
    text: string;
    status: 'published' | 'moderation' | 'rejected';
  };
}

export interface ReviewsData {
  accountId: number;
  reviews: Review[];
}

// Добавляем недостающие типы для мессенджера
export interface AvitoChat {
  id: string;
  accountId: number;
  userId: string;
  userName: string;
  userAvatar?: string;
  lastMessage?: {
    id: string;
    authorId: number;
    text: string;
    created: number;
    direction: 'in' | 'out';
    type: 'text' | 'system' | 'quick_reply' | 'voice';
    isRead?: boolean;
  };
  unreadCount: number;
  isArchived: boolean;
  hasNewMessage?: boolean;
  isStarred?: boolean;
  isPinned?: boolean;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  avitoAccountName: string; // Убираем ? - это обязательное поле
  city: string; // Убираем ? - это обязательное поле
  rk: string; // Добавляем обязательное поле rk
  context?: {
    type: string;
    value: {
      id: number;
      title: string;
      price?: string;
      url: string;
      image?: string;
      status: number;
      city?: string;
    };
  };
  tags?: string[];
  users: Array<{
    id: number;
    name: string;
    avatar?: string;
  }>;
  created: number;
  updated: number;
  createdAt: string;
  updatedAt: string;
}

export interface AvitoMessage {
  id: string;
  chatId: string;
  type: 'text' | 'system' | 'quick_reply' | 'voice';
  text: string;
  timestamp: number;
  isFromUser: boolean;
  isRead?: boolean;
  direction?: 'in' | 'out';
  content?: {
    text?: string;
    voice?: {
      voice_id: string;
    };
  };
  created?: number;
  createdFormatted?: string; // Добавляем поле для отформатированной даты
  authorId?: string;
  userId?: string; // Добавляем поле userId
  quickReplyId?: string;
  linkedOrderId?: number;
  attachments?: unknown[];
}

export interface QuickReply {
  id: string;
  title: string;
  text: string;
  type: 'text' | 'phone' | 'email';
  category: string;
  isActive: boolean;
  usageCount: number;
  accountId: number;
}

export interface MessageTemplate {
  id: string;
  name: string;
  text: string;
  category: string;
  isActive: boolean;
  usageCount: number;
  accountId: number;
}

export interface ChatFilter {
  accountIds: number[];
  tags: string[];
  isArchived: boolean;
  hasUnread: boolean;
  dateFrom?: string;
  dateTo?: string;
  status: 'all' | 'unread' | 'starred' | 'archived';
  priority: 'all' | string;
  account: 'all' | string;
  dateRange?: {
    from?: Date;
    to?: Date;
  };
}

export interface MessageStats {
  totalMessages: number;
  messagesToday: number;
  responseTime: number;
  activeChats: number;
}

export interface LinkedOrder {
  id: number;
  rk: string;
  city: string;
  clientName: string;
  phone: string;
  statusOrder: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  typeOrder: 'repeat' | 'first_time' | 'warranty';
  address: string;
  dateMeeting: string;
  typeEquipment: 'bt' | 'kp' | 'mnch';
  problem: string;
  result?: number;
  expenditure?: number;
  clean?: number;
  operatorNameId: number; // Добавляем недостающее поле
  createDate: string; // Добавляем недостающее поле
  createdAt: string; // Добавляем недостающее поле
  updatedAt: string; // Добавляем недостающее поле
  operator: {
    id: number;
    name: string;
    login: string;
  };
}