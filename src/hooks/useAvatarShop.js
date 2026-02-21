import { useState, useCallback } from "react";
import { supabase } from "../supaBaseClient.js";

export function useAvatarShop({ user, setUser }) {
  const [pendingItem, setPendingItem]   = useState(null); // item awaiting confirm
  const [purchasing, setPurchasing]     = useState(false);

  const currentKeys = user?.progress?.currency?.keys || 0;

  // Returns true if this item id is unlocked for this user
  const isUnlocked = useCallback((part, optId) => {
    // Free items are always unlocked
    const isLockedByDefault = !!optId && user?.progress?.avatar?.unlocked?.[part]?.[optId] === undefined;
    return user?.progress?.avatar?.unlocked?.[part]?.[optId] === true
      || !optId; // safety
  }, [user]);

  const openBuyModal  = useCallback((item) => setPendingItem(item), []);
  const closeBuyModal = useCallback(() => setPendingItem(null), []);

  const confirmPurchase = useCallback(async (part) => {
    if (!pendingItem || purchasing) return;
    if (currentKeys < pendingItem.keyCost) return;

    setPurchasing(true);
    try {
      const { data: fresh } = await supabase
        .from("users")
        .select("progress")
        .eq("id", user.id)
        .single();

      const progress    = fresh?.progress || {};
      const currentK    = progress?.currency?.keys || 0;
      if (currentK < pendingItem.keyCost) { setPurchasing(false); return; }

      const unlockedAvatar = {
        ...(progress?.avatar?.unlocked || {}),
        [part]: {
          ...(progress?.avatar?.unlocked?.[part] || {}),
          [pendingItem.id]: true,
        },
      };

      const updatedProgress = {
        ...progress,
        currency: { ...progress.currency, keys: currentK - pendingItem.keyCost },
        avatar: { ...(progress.avatar || {}), unlocked: unlockedAvatar },
      };

      const { data } = await supabase
        .from("users")
        .update({ progress: updatedProgress })
        .eq("id", user.id)
        .select()
        .single();

      if (data) setUser((prev) => ({ ...prev, progress: data.progress }));
    } catch (e) {
      console.error(e);
    }
    setPurchasing(false);
    setPendingItem(null);
  }, [pendingItem, purchasing, currentKeys, user, setUser]);

  return { pendingItem, purchasing, currentKeys, isUnlocked, openBuyModal, closeBuyModal, confirmPurchase };
}
