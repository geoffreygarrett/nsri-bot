import ReactSelectElement, {ActionMeta, Props as ReactSelectProps} from 'react-select';

export type {ActionMeta, SingleValue} from 'react-select';
import {components} from 'react-select';
import {FC} from "react";

export interface CustomSelectProps<T> extends ReactSelectProps<T> {
    className?: string;
    classNamePrefix?: string;
}


const customStyles = {
    control: (provided: any) => ({
        ...provided,
        minHeight: 'initial',
        height: '40px',
        width: '100%', // Or set a fixed width like '300px'
    }),
    input: (provided: any) => ({
        ...provided,
        margin: '0px',
    }),
    indicatorsContainer: (provided: any) => ({
        ...provided,
        height: '40px',
    }),
    dropdownIndicator: (base: any, state: any) => ({
        ...base,
        padding: '5px',
        transition: 'all .2s ease',
        transform: state.isFocused ? 'rotate(180deg)' : null
    }),
    menu: (base: any) => ({
        ...base,
        width: "max-content",
        minWidth: "100%"
    }),


};

const SingleValue = (props: any) => (
    <components.SingleValue {...props}>
        {props.data.chipLabel}
    </components.SingleValue>
);

const ReactSelect: FC<CustomSelectProps<any>> = ({className, classNamePrefix, ...props}) => {
    return (
        <ReactSelectElement
            options={props.options}
            className={`my-react-select-container ${className || ''}`}
            classNamePrefix={classNamePrefix || 'my-react-select'}
            components={{IndicatorSeparator: () => null, SingleValue}}
            styles={customStyles}
            {...props}
        />
    );
};

export default ReactSelect;