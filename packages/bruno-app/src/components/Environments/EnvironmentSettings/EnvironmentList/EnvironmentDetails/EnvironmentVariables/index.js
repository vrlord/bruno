import React from 'react';
import toast from 'react-hot-toast';
import cloneDeep from 'lodash/cloneDeep';
import { IconTrash } from '@tabler/icons';
import { useTheme } from 'providers/Theme';
import { useDispatch } from 'react-redux';
import { saveEnvironment } from 'providers/ReduxStore/slices/collections/actions';
import SingleLineEditor from 'components/SingleLineEditor';
import StyledWrapper from './StyledWrapper';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { uuid } from 'utils/common';
import { variableNameRegex } from 'utils/common/regex';
import { maskInputValue } from 'utils/collections';

const EnvironmentVariables = ({ environment, collection }) => {
  const dispatch = useDispatch();
  const { storedTheme } = useTheme();

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: environment.variables || [],
    validationSchema: Yup.array().of(
      Yup.object({
        enabled: Yup.boolean(),
        name: Yup.string()
          .required('Name cannot be empty')
          .matches(
            variableNameRegex,
            'Name contains invalid characters. Must only contain alphanumeric characters, "-", "_", "." and cannot start with a digit.'
          )
          .trim(),
        secret: Yup.boolean(),
        type: Yup.string(),
        uid: Yup.string(),
        value: Yup.string().trim().nullable()
      })
    ),
    onSubmit: (values) => {
      if (!formik.dirty) {
        toast.error('Nothing to save');
        return;
      }

      dispatch(saveEnvironment(cloneDeep(values), environment.uid, collection.uid))
        .then(() => {
          toast.success('Changes saved successfully');
          formik.resetForm({ values });
        })
        .catch(() => toast.error('An error occurred while saving the changes'));
    }
  });

  const ErrorMessage = ({ name }) => {
    const meta = formik.getFieldMeta(name);
    if (!meta.error) {
      return null;
    }

    return (
      <label htmlFor={name} className="text-red-500">
        {meta.error}
      </label>
    );
  };

  const addVariable = () => {
    const newVariable = {
      uid: uuid(),
      name: '',
      value: '',
      type: 'text',
      secret: false,
      enabled: true
    };
    formik.setFieldValue(formik.values.length, newVariable, false);
  };

  const handleRemoveVar = (id) => {
    formik.setValues(formik.values.filter((variable) => variable.uid !== id));
  };

  return (
    <StyledWrapper className="w-full mt-6 mb-6">
      <div className="h-[50vh] overflow-y-auto w-full">
        <table>
          <thead>
            <tr>
              <td>Enabled</td>
              <td>Name</td>
              <td>Value</td>
              <td>Secret</td>
              <td></td>
            </tr>
          </thead>
          <tbody>
            {formik.values.map((variable, index) => (
              <tr key={variable.uid}>
                <td className="text-center">
                  <input
                    type="checkbox"
                    className="mr-3 mousetrap"
                    name={`${index}.enabled`}
                    checked={variable.enabled}
                    onChange={formik.handleChange}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    className="mousetrap"
                    id={`${index}.name`}
                    name={`${index}.name`}
                    value={variable.name}
                    onChange={formik.handleChange}
                  />
                  <ErrorMessage name={`${index}.name`} />
                </td>
                <td>
                  {variable.secret ? (
                    <div className="overflow-hidden text-ellipsis">{maskInputValue(variable.value)}</div>
                  ) : (
                    <SingleLineEditor
                      theme={storedTheme}
                      collection={collection}
                      name={`${index}.value`}
                      value={variable.value}
                      onChange={(newValue) => formik.setFieldValue(`${index}.value`, newValue, true)}
                    />
                  )}
                </td>
                <td>
                  <input
                    type="checkbox"
                    className="mr-3 mousetrap"
                    name={`${index}.secret`}
                    checked={variable.secret}
                    onChange={formik.handleChange}
                  />
                </td>
                <td>
                  <button onClick={() => handleRemoveVar(variable.uid)}>
                    <IconTrash strokeWidth={1.5} size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <button className="btn-add-param text-link pr-2 py-3 mt-2 select-none" onClick={addVariable}>
          + Add Variable
        </button>
      </div>

      <div>
        <button type="submit" className="submit btn btn-md btn-secondary mt-2" onClick={formik.handleSubmit}>
          Save
        </button>
      </div>
    </StyledWrapper>
  );
};
export default EnvironmentVariables;
