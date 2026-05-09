import React, { useCallback, useState } from "react";
import { Button, View } from "react-native";

declare const MemoChild: React.ComponentType<{ onTap: () => void }>;

// ❌ BAD: Function created "on the fly"
export function Parent_BAD() {
    const [count, setCount] = useState(0);
    // Every time count changes, handleTap is a NEW instance in memory
    const handleTap = () => console.log("Tapped!");

    return (
        <View>
            <Button onPress={() => setCount(count + 1)} title="+1" />

            {/* MemoChild sees a NEW prop, so it triggers a heavy re-render */}
            <MemoChild onTap={handleTap} />
        </View>
    );
}

// ✅ GOOD: Function identity is preserved
export function Parent_GOOD() {
    const [count, setCount] = useState(0);

    // useCallback ensures handleTap stays the same across renders
    const handleTap = useCallback(() => {
        console.log("Tapped!");
    }, []);

    return (
        <View>
            <Button onPress={() => setCount(count + 1)} title="+1" />

            {/* MemoChild sees the SAME reference. It skips the render! */}
            <MemoChild onTap={handleTap} />
        </View>
    );
}