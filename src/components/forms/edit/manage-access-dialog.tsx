'use client'

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Trash2, Search, UserPlus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel } from "@/components/ui/field";
import { addFormAccess, removeFormAccess, updateFormAccess, searchUsers, getFormAccessUsers, updateFormPublicity, getFormPublicity } from "@/db/forms/access/manage-form-access";
import { FormRole } from "@/lib/form-access";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const roleLabels: Record<string, string> = {
    editor: 'Редактор',
    reader: 'Читатель',
    participant: 'Участник',
};

const roleDescriptions: Record<string, string> = {
    editor: 'Может редактировать форму и просматривать результаты',
    reader: 'Может только просматривать результаты',
    participant: 'Может только проходить форму',
};

type UserWithAccess = {
    id: number;
    userId: number;
    role: FormRole | null;
    createdAt: Date;
    user: {
        id: number;
        username: string;
        email: string;
    };
};

type SearchUser = {
    id: number;
    username: string;
    email: string;
};

export default function ManageAccessDialog({ formId }: { formId: number }) {
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [accessUsers, setAccessUsers] = useState<UserWithAccess[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [selectedRole, setSelectedRole] = useState<'editor' | 'reader' | 'participant'>('participant');
    const [isPublic, setIsPublic] = useState(false);

    // Загружаем список пользователей с доступом и публичность формы
    const loadAccessUsers = useCallback(async () => {
        try {
            const [users, publicity] = await Promise.all([
                getFormAccessUsers(formId),
                getFormPublicity(formId)
            ]);
            setAccessUsers(users);
            setIsPublic(publicity);
        } catch (error) {
            toast.error('Не удалось загрузить данные');
        }
    }, [formId]);

    useEffect(() => {
        if (open) {
            loadAccessUsers();
        }
    }, [open, loadAccessUsers]);

    // Поиск пользователей
    const handleSearch = useCallback(async (query: string) => {
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const results = await searchUsers(query);
            // Фильтруем пользователей, которые уже имеют доступ
            const existingUserIds = new Set(accessUsers.map(u => u.userId));
            const filtered = results.filter(u => !existingUserIds.has(u.id));
            setSearchResults(filtered);
        } catch (error) {
            toast.error('Ошибка поиска пользователей');
        } finally {
            setIsSearching(false);
        }
    }, [accessUsers]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            handleSearch(searchQuery);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchQuery, handleSearch]);

    // Добавление доступа
    const handleAddAccess = async (userId: number, role: 'editor' | 'reader' | 'participant') => {
        setIsLoading(true);
        try {
            await addFormAccess(formId, userId, role);
            toast.success('Доступ успешно добавлен');
            setSearchQuery("");
            setSearchResults([]);
            await loadAccessUsers();
        } catch (error) {
            toast.error((error as Error).message || 'Не удалось добавить доступ');
        } finally {
            setIsLoading(false);
        }
    };

    // Удаление доступа
    const handleRemoveAccess = async (userId: number) => {
        setIsLoading(true);
        try {
            await removeFormAccess(formId, userId);
            toast.success('Доступ успешно удален');
            await loadAccessUsers();
        } catch (error) {
            toast.error((error as Error).message || 'Не удалось удалить доступ');
        } finally {
            setIsLoading(false);
        }
    };

    // Изменение роли
    const handleUpdateRole = async (userId: number, role: 'editor' | 'reader' | 'participant') => {
        setIsLoading(true);
        try {
            await updateFormAccess(formId, userId, role);
            toast.success('Роль успешно изменена');
            await loadAccessUsers();
        } catch (error) {
            toast.error((error as Error).message || 'Не удалось изменить роль');
        } finally {
            setIsLoading(false);
        }
    };

    // Изменение публичности формы
    const handleTogglePublicity = async (checked: boolean) => {
        setIsLoading(true);
        try {
            await updateFormPublicity(formId, checked);
            setIsPublic(checked);
            toast.success(checked ? 'Форма опубликована' : 'Форма скрыта');
        } catch (error) {
            toast.error((error as Error).message || 'Не удалось изменить публичность');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Управление доступом
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Управление доступом к форме</DialogTitle>
                    <DialogDescription>
                        Управляйте публичностью формы и правами доступа пользователей
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Настройка публичности */}
                    <div className="space-y-2 border-b pb-4">
                        <label className="text-sm font-medium">Публичность формы</label>
                        <Field orientation="horizontal">
                            <Checkbox
                                id="form-publicity-checkbox"
                                checked={isPublic}
                                onCheckedChange={handleTogglePublicity}
                                disabled={isLoading}
                            />
                            <FieldLabel
                                htmlFor="form-publicity-checkbox"
                                className="font-normal"
                            >
                                Сделать форму публичной
                            </FieldLabel>
                        </Field>
                        <p className="text-xs text-muted-foreground">
                            Публичные формы доступны всем пользователям по ссылке. Приватные формы доступны только пользователям с явным доступом.
                        </p>
                    </div>
                    {/* Поиск пользователей */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Добавить пользователя</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Поиск по email или username..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                            {isSearching && (
                                <Spinner className="absolute right-3 top-1/2 transform -translate-y-1/2" />
                            )}
                        </div>

                        {/* Результаты поиска */}
                        {searchResults.length > 0 && (
                            <div className="border rounded-md p-2 space-y-2 max-h-40 overflow-y-auto">
                                {searchResults.map((user) => (
                                    <div
                                        key={user.id}
                                        className="flex items-center justify-between p-2 hover:bg-muted rounded-md"
                                    >
                                        <div>
                                            <div className="font-medium">{user.username}</div>
                                            <div className="text-sm text-muted-foreground">{user.email}</div>
                                        </div>
                                        <div className="flex gap-2">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="outline" size="sm">
                                                        Выбрать роль
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem onClick={() => handleAddAccess(user.id, 'editor')}>
                                                        Редактор
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleAddAccess(user.id, 'reader')}>
                                                        Читатель
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleAddAccess(user.id, 'participant')}>
                                                        Участник
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
                            <div className="text-sm text-muted-foreground text-center py-2">
                                Пользователи не найдены
                            </div>
                        )}
                    </div>

                    {/* Список пользователей с доступом */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Пользователи с доступом</label>
                        {accessUsers.length === 0 ? (
                            <div className="text-sm text-muted-foreground text-center py-4">
                                Нет пользователей с доступом
                            </div>
                        ) : (
                            <div className="border rounded-md divide-y">
                                {accessUsers.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between p-3 hover:bg-muted/50"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{item.user.username}</span>
                                                {item.role && (
                                                    <Badge variant={item.role === 'editor' ? 'default' : 'secondary'}>
                                                        {roleLabels[item.role]}
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="text-sm text-muted-foreground">{item.user.email}</div>
                                            {item.role && (
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    {roleDescriptions[item.role]}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="outline" size="sm" disabled={isLoading}>
                                                        Изменить роль
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem
                                                        onClick={() => handleUpdateRole(item.userId, 'editor')}
                                                        disabled={item.role === 'editor'}
                                                    >
                                                        Редактор
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleUpdateRole(item.userId, 'reader')}
                                                        disabled={item.role === 'reader'}
                                                    >
                                                        Читатель
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleUpdateRole(item.userId, 'participant')}
                                                        disabled={item.role === 'participant'}
                                                    >
                                                        Участник
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemoveAccess(item.userId)}
                                                disabled={isLoading}
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Закрыть
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
