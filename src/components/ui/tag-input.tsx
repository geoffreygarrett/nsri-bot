import React from 'react';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {X} from 'lucide-react';
import {cn} from '@/lib/utils';

interface TagInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    placeholder?: string;
    tags: string[];
    setTags: React.Dispatch<React.SetStateAction<string[]>>;
}

// The TagInputProps should now include onValidationResult callback
const TagInput = React.forwardRef<HTMLInputElement, TagInputProps & {
    separator?: string | string[],
    validateTag?: (tag: string) => boolean,
    onValidationResult?: (tag: string, isValid: boolean) => void,
    formatTag?: (tag: string) => string,
}>(({ placeholder, tags, setTags, className, separator = [',', ' ', '\n'], validateTag, onValidationResult, formatTag }, ref) => {

    const [inputValue, setInputValue] = React.useState('');
    const inputRef = React.useRef<HTMLInputElement>(null);

    const processInputValue = () => {
        const separators = Array.isArray(separator) ? separator : [separator];
        const regex = new RegExp(`[${separators.map(sep => `\\${sep}`).join('')}]`);
        const enteredTags = inputValue.split(regex)
            .map(tag => tag.trim())
            .filter(tag => {
                if (!tag) return false; // skip empty strings
                const isValid = !validateTag || validateTag(tag);
                onValidationResult?.(tag, isValid); // Invoke callback with validation result
                return isValid;
            })
            .map(tag => formatTag ? formatTag(tag) : tag); // Format tag if formatter is provided
        const newTags = Array.from(new Set([...tags, ...enteredTags])); // Remove duplicates
        setTags(newTags);
        setInputValue(''); // Clear input
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || separator.includes(e.key)) {
            e.preventDefault();
            processInputValue();
        }
    };

    const handleBlur = () => {
        processInputValue(); // Attempt to save the last text when input loses focus
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter((tag) => tag !== tagToRemove));
    };

    return (
        <div className={cn(className)}>
            <div className={`flex flex-wrap gap-2 rounded-md ${tags.length !== 0 && 'mb-3'}`}>
                {tags.map((tag, index) => (
                    <span key={index}
                          className="transition-all border bg-secondary text-secondary-foreground hover:bg-secondary/80 inline-flex h-8 items-center text-sm pl-2 rounded-md">
                        {tag}
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => removeTag(tag)}
                            className={cn("py-1 px-3 h-full hover:bg-transparent")}
                        >
                            <X size={14}/> {/* Assuming X is a valid icon component */}
                        </Button>
                    </span>
                ))}
            </div>
            <Input
                ref={inputRef}
                type="text"
                placeholder={placeholder}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur} // Add onBlur event handler
                className={className}
            />
        </div>
    );
});

TagInput.displayName = 'TagInput';

export {TagInput};
