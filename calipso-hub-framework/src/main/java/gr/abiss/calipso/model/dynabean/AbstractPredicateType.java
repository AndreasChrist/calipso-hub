/**
 *
 *
 * Copyright (c) 2007 - 2013 www.Abiss.gr
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package gr.abiss.calipso.model.dynabean;

import gr.abiss.calipso.model.entities.AbstractPersistable;

import javax.persistence.MappedSuperclass;

/**
 * Abstract base persistent class for dynamic bean properties
 */
@MappedSuperclass
public abstract class AbstractPredicateType<O extends PredicateObject> extends
		AbstractPersistable {

	private static final long serialVersionUID = -1468517690700208260L;

	private Class<O> objectType;

	private String name;
	private String caption;
	private String placeholder;
	private String options;


}